<template>
  <div v-if="visible" class="login-modal-overlay" @click.self="close">
    <div class="login-modal">
      <div class="modal-header">
        <h2>{{ activeTab === 'login' ? '登录' : '注册' }}</h2>
        <button class="close-btn" @click="close">
          <Icon icon="carbon:close" />
        </button>
      </div>
      
      <div class="modal-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>
      
      <div class="modal-content">
        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
          <div class="form-group">
            <label>手机号</label>
            <input 
              type="tel" 
              v-model="loginForm.phone" 
              placeholder="请输入手机号"
              class="glass-input"
              required
            />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              type="password" 
              v-model="loginForm.password" 
              placeholder="请输入密码"
              class="glass-input"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary full-width" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister">
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="registerForm.username" 
              placeholder="请输入用户名"
              class="glass-input"
              required
            />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input 
              type="tel" 
              v-model="registerForm.phone" 
              placeholder="请输入手机号"
              class="glass-input"
              required
            />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              type="password" 
              v-model="registerForm.password" 
              placeholder="请设置密码"
              class="glass-input"
              required
            />
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input 
              type="password" 
              v-model="registerForm.confirmPassword" 
              placeholder="请再次输入密码"
              class="glass-input"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary full-width" :disabled="isLoading">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useLoginStore } from '../stores/loginStore.js'
import { API_BASE_URL, API_ENDPOINTS } from '../config.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'login-success'])
const loginStore = useLoginStore()

// 状态管理
const activeTab = ref('login')
const isLoading = ref(false)
const errorMessage = ref('')

// 表单数据
const loginForm = reactive({
  phone: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 关闭弹窗
const close = () => {
  emit('close')
  // 重置表单和错误信息
  resetForms()
}

// 重置表单
const resetForms = () => {
  loginForm.phone = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.phone = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  errorMessage.value = ''
}

// 处理登录
  const handleLogin = async () => {
    isLoading.value = true
    // 保留之前可能的提示信息（如注册成功提示），除非有新错误
    // 不在这里清空errorMessage，让错误信息自然替换
    
    try {
      // 验证表单
      if (!loginForm.phone || !loginForm.password) {
        throw new Error('请输入手机号和密码')
      }
      
      // 发送登录请求
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: loginForm.phone,
        password: loginForm.password
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || '登录失败，请检查手机号和密码')
    }
    
    // 保存登录状态
    loginStore.login(data)
    
    // 触发登录成功事件
    emit('login-success')
    
    // 关闭弹窗
    close()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 验证密码
    if (registerForm.password !== registerForm.confirmPassword) {
      throw new Error('两次输入的密码不一致')
    }
    
    if (!registerForm.username || !registerForm.phone || !registerForm.password) {
      throw new Error('请填写完整的注册信息')
    }
    console.log(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`)
    // 发送注册请求
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: registerForm.phone,
        password: registerForm.password,
        name: registerForm.username
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || '注册失败，请稍后重试')
    }
    
    // 注册成功后切换到登录标签页
    activeTab.value = 'login'
    // 将注册的手机号填充到登录表单
    loginForm.phone = registerForm.phone
    // 清空密码字段，提示用户输入密码登录
    loginForm.password = ''
    // 清空错误信息
    errorMessage.value = '注册成功，请登录'
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.modal-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.glass-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.glass-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>