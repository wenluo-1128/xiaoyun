<template>
  <div class="form-page">
    <!-- 登录弹窗 -->
    <LoginModal 
      :visible="showLoginModal" 
      @close="handleCloseLoginModal"
      @login-success="handleLoginSuccess"
    />
    <div class="glass-card">
      <h1 class="gradient-text page-title">定制您的完美旅行</h1>
      <p class="page-description">告诉我们您的喜好，我们将为您打造专属旅游方案</p>
      
      <!-- 进度指示器 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-indicator"
            :class="{ active: index <= currentStep, completed: index < currentStep }"
          >
            <span v-if="index < currentStep">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
        </div>
      </div>
      
      <!-- 表单步骤 -->
      <div class="form-container">
        <!-- 步骤1：旅行基本信息 -->
        <transition name="slide">
          <div v-if="currentStep === 0" class="form-step">
            <h2 class="step-title">旅行基本信息</h2>
            
            <!-- 目的地：省份-城市二级联动 -->
            <div class="form-group">
              <label>目的地 <span class="required">*</span></label>
              <div class="cascade-select">
                <select v-model="formData.province" class="glass-input province-select" @change="onProvinceChange">
                  <option value="">请选择省份</option>
                  <option v-for="province in provinces" :key="province.code" :value="province.code">
                    {{ province.name }}
                  </option>
                </select>
                <select v-model="formData.city" class="glass-input city-select">
                  <option value="">请选择城市</option>
                  <option v-for="city in currentCities" :key="city.code" :value="city.code">
                    {{ city.name }}
                  </option>
                </select>
              </div>
              <div v-if="errors.province || errors.city" class="error-message">{{ errors.destination }}</div>
            </div>
            
            <!-- 出行时间 -->
            <div class="form-group">
              <label>出行时间 <span class="required">*</span></label>
              <div class="date-range">
                <div class="date-item">
                  <span class="date-label">出发日期：</span>
                  <input type="date" v-model="formData.startDate" class="glass-input" />
                </div>
                <div class="date-item">
                  <span class="date-label">返回日期：</span>
                  <input type="date" v-model="formData.endDate" class="glass-input" />
                </div>
              </div>
              <div v-if="errors.startDate || errors.endDate" class="error-message">{{ errors.date }}</div>
            </div>
            
            <!-- 预算范围 -->
            <div class="form-group">
              <label>预算范围 <span class="required">*</span></label>
              <div class="budget-range">
                <div class="budget-item">
                  <span class="currency-symbol">¥</span>
                  <input type="number" v-model.number="formData.minBudget" class="glass-input budget-input" placeholder="最低预算" min="0" />
                </div>
                <div class="budget-item">
                  <span class="currency-symbol">¥</span>
                  <input type="number" v-model.number="formData.maxBudget" class="glass-input budget-input" placeholder="最高预算" min="0" />
                </div>
              </div>
              <div v-if="errors.minBudget || errors.maxBudget" class="error-message">{{ errors.budget }}</div>
            </div>
            
            <!-- 出行人数 -->
            <div class="form-group">
              <label>出行人数 <span class="required">*</span></label>
              <div class="people-count">
                <div class="people-item">
                  <span class="people-label">成人：</span>
                  <input type="number" v-model.number="formData.adultCount" class="glass-input people-input" min="1" />
                </div>
                <div class="people-item">
                  <span class="people-label">儿童：</span>
                  <input type="number" v-model.number="formData.childCount" class="glass-input people-input" min="0" />
                </div>
              </div>
              <div v-if="errors.adultCount" class="error-message">{{ errors.adultCount }}</div>
            </div>
            <div class="form-group">
                <label>备注信息（选填）</label>
                <textarea v-model="formData.remark" class="glass-input" rows="4" placeholder="请输入其他需要说明的信息"></textarea>
              </div>
          </div>
        </transition>
        
        <!-- 步骤2：确认提交 -->
        <transition name="slide">
          <div v-if="currentStep === 1" class="form-step">
            <h2 class="step-title">确认信息</h2>
            
            <div class="confirm-section">
              <h3>旅行基本信息</h3>
              <div class="confirm-item">
                <span class="confirm-label">目的地：</span>
                <span class="confirm-value">{{ getProvinceName(formData.province) }} - {{ getCityName(formData.province, formData.city) }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">出行时间：</span>
                <span class="confirm-value">{{ formatDate(formData.startDate) }} 至 {{ formatDate(formData.endDate) }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">预算范围：</span>
                <span class="confirm-value">¥{{ formData.minBudget }} - ¥{{ formData.maxBudget }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">出行人数：</span>
                <span class="confirm-value">{{ formData.adultCount }}位成人，{{ formData.childCount }}位儿童</span>
              </div>
              <div v-if="formData.remark" class="confirm-item">
                <span class="confirm-label">备注信息：</span>
                <span class="confirm-value">{{ formData.remark }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- 表单按钮 -->
      <div class="form-actions">
        <button 
          v-if="currentStep > 0" 
          @click="prevStep"
          class="btn btn-secondary"
        >
          <Icon icon="carbon:chevron-left" /> 上一步
        </button>
        <button 
          v-if="currentStep < steps.length - 1" 
          @click="nextStep"
          :disabled="!isCurrentStepValid"
          class="btn btn-primary"
          :class="{ disabled: !isCurrentStepValid }"
        >
          下一步 <Icon icon="carbon:chevron-right" />
        </button>
        <button 
          v-else 
          @click="submitForm"
          class="btn btn-primary"
        >
          <Icon icon="carbon:checkmark-filled" /> 一键定制
        </button>
      </div>
    </div>
    
    <!-- 成功提示弹窗 -->
    <transition name="fade">
      <div v-if="showSuccess" class="success-modal">
        <div class="modal-content">
          <div class="success-icon">✓</div>
          <h3>提交成功！</h3>
          <p>感谢您的定制请求，请前往个人中心查看进度</p>
          <button @click="resetForm" class="btn btn-primary" style="margin:0 auto;margin-top:10px;">确定</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useLoginStore } from '../stores/loginStore.js'
import LoginModal from '../components/LoginModal.vue'

const currentStep = ref(0)
const showSuccess = ref(false)
const steps = ['旅行基本信息', '确认提交']

// 省份城市数据
const provinces = [
  { code: 'beijing', name: '北京' },
  { code: 'shanghai', name: '上海' },
  { code: 'guangdong', name: '广东' },
  { code: 'jiangsu', name: '江苏' },
  { code: 'zhejiang', name: '浙江' },
  { code: 'sichuan', name: '四川' },
  { code: 'yunnan', name: '云南' },
  { code: 'hunan', name: '湖南' },
  { code: 'shandong', name: '山东' },
  { code: 'fujian', name: '福建' },
  { code: 'hainan', name: '海南' },
  { code: 'anhui', name: '安徽' }
]

const citiesData = {
  beijing: [{ code: 'beijing', name: '北京' }],
  shanghai: [{ code: 'shanghai', name: '上海' }],
  guangdong: [
    { code: 'guangzhou', name: '广州' },
    { code: 'shenzhen', name: '深圳' },
    { code: 'zhuhai', name: '珠海' },
    { code: 'foshan', name: '佛山' },
    { code: 'dongguan', name: '东莞' },
    { code: 'chaozhou', name: '潮州' }
  ],
  jiangsu: [
    { code: 'nanjing', name: '南京' },
    { code: 'suzhou', name: '苏州' },
    { code: 'wuxi', name: '无锡' },
    { code: 'xuzhou', name: '徐州' },
    { code: 'changzhou', name: '常州' }
  ],
  zhejiang: [
    { code: 'hangzhou', name: '杭州' },
    { code: 'ningbo', name: '宁波' },
    { code: 'wenzhou', name: '温州' },
    { code: 'shaoxing', name: '绍兴' },
    { code: 'jiaxing', name: '嘉兴' }
  ],
  sichuan: [
    { code: 'chengdu', name: '成都' },
    { code: 'jiuzhaigou', name: '九寨沟' },
    { code: 'emeishan', name: '峨眉山' },
    { code: 'panzhihua', name: '攀枝花' }
  ],
  yunnan: [
    { code: 'kunming', name: '昆明' },
    { code: 'dali', name: '大理' },
    { code: 'lijiang', name: '丽江' },
    { code: 'xishuangbanna', name: '西双版纳' },
    { code: 'shangri-la', name: '香格里拉' }
  ],
  hunan: [
    { code: 'changsha', name: '长沙' },
    { code: 'zhangjiajie', name: '张家界' },
    { code: 'fenghuang', name: '凤凰古城' },
    { code: 'yueyang', name: '岳阳' }
  ],
  shandong: [
    { code: 'jinan', name: '济南' },
    { code: 'qingdao', name: '青岛' },
    { code: 'yantai', name: '烟台' },
    { code: 'rizhao', name: '日照' }
  ],
  fujian: [
    { code: 'fuzhou', name: '福州' },
    { code: 'xiamen', name: '厦门' },
    { code: 'quanzhou', name: '泉州' },
    { code: 'zhangzhou', name: '漳州' }
  ],
  hainan: [
    { code: 'haikou', name: '海口' },
    { code: 'sanya', name: '三亚' },
    { code: 'wenchang', name: '文昌' }
  ],
  anhui: [
    { code: 'hefei', name: '合肥' },
    { code: 'huangshan', name: '黄山' },
    { code: 'anqing', name: '安庆' }
  ]
}



// 登录状态管理
const router = useRouter()
const loginStore = useLoginStore()
const showLoginModal = ref(false)

// 表单数据
const formData = reactive({
  // 旅行基本信息
  province: '',
  city: '',
  startDate: '',
  endDate: '',
  minBudget: '',
  maxBudget: '',
  adultCount: 1,
  childCount: 0,
  remark: ''
})

// 表单验证错误
const errors = reactive({})

// 计算属性：当前城市列表
const currentCities = computed(() => {
  return formData.province ? citiesData[formData.province] || [] : []
})

// 计算属性：当前步骤是否有效
const isCurrentStepValid = computed(() => {
  validateCurrentStep()
  
  if (currentStep.value === 0) {
    // 第一步验证
    return !errors.province && !errors.city && !errors.startDate && !errors.endDate && 
           !errors.minBudget && !errors.maxBudget && !errors.adultCount
  }
  return true
})

// 验证当前步骤
const validateCurrentStep = () => {
  // 清空错误
  Object.keys(errors).forEach(key => delete errors[key])
  
  if (currentStep.value === 0) {
    // 验证第一步
    if (!formData.province || !formData.city) {
      errors.destination = '请选择完整的目的地信息'
      errors.province = true
      errors.city = true
    }
    
    if (!formData.startDate) {
      errors.date = '请选择出发日期'
      errors.startDate = true
    } else if (!formData.endDate) {
      errors.date = '请选择返回日期'
      errors.endDate = true
    } else if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.date = '返回日期必须晚于出发日期'
      errors.startDate = true
      errors.endDate = true
    } else if (new Date(formData.startDate) < new Date()) {
      errors.date = '出发日期不能早于今天'
      errors.startDate = true
    }
    
    if (!formData.minBudget || formData.minBudget < 0) {
      errors.budget = '请输入有效的最低预算'
      errors.minBudget = true
    } else if (!formData.maxBudget || formData.maxBudget < 0) {
      errors.budget = '请输入有效的最高预算'
      errors.maxBudget = true
    } else if (formData.minBudget > formData.maxBudget) {
      errors.budget = '最高预算必须大于最低预算'
      errors.minBudget = true
      errors.maxBudget = true
    }
    
    if (!formData.adultCount || formData.adultCount < 1) {
      errors.adultCount = '成人人数至少为1人'
    } else if (formData.childCount < 0) {
      errors.childCount = '儿童人数不能为负数'
    }
  }
  return true
}

// 省份变化处理
const onProvinceChange = () => {
  formData.city = ''
  delete errors.province
  delete errors.city
  delete errors.destination
}

// 获取省份名称
const getProvinceName = (code) => {
  const province = provinces.find(p => p.code === code)
  return province ? province.name : ''
}

// 获取城市名称
const getCityName = (provinceCode, cityCode) => {
  const cities = citiesData[provinceCode] || []
  const city = cities.find(c => c.code === cityCode)
  return city ? city.name : ''
}



// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 下一步
const nextStep = () => {
  if (currentStep.value < steps.length - 1 && isCurrentStepValid.value) {
    currentStep.value++
    // 滚动到顶部以获得更好的用户体验
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    // 滚动到顶部以获得更好的用户体验
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 当前方案id
const currentPlanId = ref(null);

// 提交表单
const submitForm = () => {
  console.log(formData)
  let isValid = validateCurrentStep()
  console.log(isValid)
  // 确保第二步数据有效
  if (isValid) {
    // 这里可以添加表单提交逻辑
    console.log('表单数据:', formData)
    
    // 模拟表单提交过程
    const submitButton = document.querySelector('.btn-primary[type="button"]')
    let originalText = ''
    if (submitButton) {
      originalText = submitButton.textContent
      submitButton.disabled = true
      submitButton.innerHTML = '<Icon icon="carbon:loading" /> 提交中...'
    }
    
    // 模拟网络请求延迟
    setTimeout(() => {
      showSuccess.value = true
      if (submitButton) {
        submitButton.disabled = false
        submitButton.innerHTML = originalText
      }
    }, 1500)
    
    // 调用生成旅行方案的函数
    generateTravelPlan();
  }
}

// 生成旅行方案
const generateTravelPlan = async () => {
  try {
    // 从本地存储中获取用户ID
    const userStr = localStorage.getItem('user');
    const userObj = JSON.parse(userStr);
    const userid = userObj.data.id;
    
    // 准备表单数据用于生成方案
    const travelInfo = {
      destination: `${getProvinceName(formData.province)} - ${getCityName(formData.province, formData.city)}`,
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      budget: `¥${formData.minBudget} - ¥${formData.maxBudget}`,
      peopleCount: `${formData.adultCount}位成人，${formData.childCount}位儿童`,
      remark: formData.remark
    };
    
    // 构造提示词，模拟聊天记录的形式
    const prompt = `用户需要定制旅行方案，以下是详细信息：
目的地：${travelInfo.destination}
出行时间：${travelInfo.startDate} 至 ${travelInfo.endDate}
预算范围：${travelInfo.budget}
出行人数：${travelInfo.peopleCount}
${travelInfo.remark ? `备注：${travelInfo.remark}` : ''}

请为用户生成一份详细的旅游方案。`;
    
    // 定义baseUrl变量
    const baseUrl = 'http://172.30.32.1:8080';
    const newApiKey = 'application-671304ec532e25e706b4cd654b104fb7';
    
    // 1. 获取会话ID
    const sessionResponse = await fetch(`${baseUrl}/chat/api/open`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const sessionData = await sessionResponse.json();
    if (sessionData.code !== 200) {
      throw new Error(`获取会话ID失败: ${sessionData.message}`);
    }
    
    const chatId = sessionData.data;
    
    // 2. 调用chat_message接口获取AI生成的方案
    const chatResponse = await fetch(`${baseUrl}/chat/api/chat_message/${chatId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${newApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        info: prompt,
        message: prompt,
        stream: false,
        re_chat: false
      })
    });
    const chatData = await chatResponse.json();
    
    // 获取AI生成的方案内容
    let aiPlan = chatData.data.content || '';
    console.log('AI生成的方案:', aiPlan);
    
    // 生成加密后的标识符keyword
    function simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }
    
    const dataToHash = `${userid}${aiPlan}`;
    let keyword = simpleHash(dataToHash);
    // 如果哈希结果不足50位，补充随机字符
    while (keyword.length < 50) {
      keyword += simpleHash(`${keyword}${Date.now()}`);
    }
    keyword = keyword.substring(0, 50);
    
    // 构建message参数
    const messageObject = {
      userid: userid,
      query_keyword: keyword,
      ai: aiPlan
    };
    const messageData = JSON.stringify(messageObject);
    
    // 三个接口并行调用
    const secondApiKey = 'application-307c1435d45c0b294efed46a9956d4db';
    const API_BASE_URL = '/api';
    const ApiKey = 'application-a242f7ed373e9c173fd6b0c5c215846d'
          
    const API_ENDPOINTS = {
      CREATE_FORM: '/ing-forms/create'
    };
    
    // 第一个接口的调用函数
    const callFirstInterface = async () => {
      try {
        // 1. 获取会话ID
        const sessionResponse = await fetch(`${baseUrl}/chat/api/open`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const sessionData = await sessionResponse.json();
        if (sessionData.code !== 200) {
          throw new Error(`获取会话ID失败: ${sessionData.message}`);
        }
        
        const chatId = sessionData.data;
        
        // 2. 调用chat_message接口
        await fetch(`${baseUrl}/chat/api/chat_message/${chatId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageData,
            stream: false,
            re_chat: false
          })
        });
        
        console.log('第一个接口调用成功');
      } catch (error) {
        console.error('第一个接口调用失败:', error);
      }
    };
    
    // 第二个接口的调用函数
    const callSecondInterface = async () => {
      try {
        // 1. 获取会话ID
        const sessionResponse = await fetch(`${baseUrl}/chat/api/open`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secondApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const sessionData = await sessionResponse.json();
        if (sessionData.code !== 200) {
          throw new Error(`获取第二个会话ID失败: ${sessionData.message}`);
        }
        
        const chatId = sessionData.data;
        
        // 2. 调用chat_message接口
        const chatResponse = await fetch(`${baseUrl}/chat/api/chat_message/${chatId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secondApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageData,
            stream: false,
            re_chat: false
          })
        });
        
        if (!chatResponse.ok) {
          throw new Error(`第二个接口HTTP error! status: ${chatResponse.status}`);
        }
        
        console.log('第二个接口调用成功');
      } catch (error) {
        console.error('第二个接口调用失败:', error);
      }
    };
    
    // 第三个接口的调用函数
    const callThirdInterface = async () => {
      try {
        const formData = {
          user_id: userid,
          codeid: keyword
        };
        
        const formResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_FORM}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!formResponse.ok) {
          throw new Error(`第三个接口HTTP error! status: ${formResponse.status}`);
        }
        
        // 获取响应数据并返回id
        const responseData = await formResponse.json();
        console.log('第三个接口调用成功，返回数据:', responseData);
        
        // 更新currentPlanId
        currentPlanId.value = responseData.data.id;
        console.log('获取成功的方案ID:', currentPlanId.value);
        // 存储旅行方案信息到localStorage
    const travelPlanInfo = {
      id: currentPlanId.value,
      title: `${travelInfo.destination}之旅`,
      destination: travelInfo.destination,
      dates: `${travelInfo.startDate} 至 ${travelInfo.endDate}`,
      peopleCount: travelInfo.peopleCount,
      budget: travelInfo.budget,
      status: '进行中',
      preferences: {
        destination: travelInfo.destination,
        startDate: travelInfo.startDate,
        endDate: travelInfo.endDate,
        budget: travelInfo.budget,
        peopleCount: travelInfo.peopleCount,
        remark: travelInfo.remark
      }
    };
    
    // 获取现有方案数组，如果不存在则创建空数组
    const existingPlans = JSON.parse(localStorage.getItem('travelPlans') || '[]');
    // 添加新方案到数组开头
    existingPlans.unshift(travelPlanInfo);
    // 保存更新后的数组
    localStorage.setItem('travelPlans', JSON.stringify(existingPlans));
    console.log('旅行方案信息已保存到localStorage');
        
      } catch (error) {
        console.error('第三个接口调用失败:', error);
        return null; // 出错时返回null
      }
    };
    
    // 使用Promise.all并行调用三个接口，并获取第三个接口的返回值
    await Promise.all([
      callFirstInterface(),
      callSecondInterface(),
      callThirdInterface()
    ]);
    
    
    
  } catch (error) {
    console.error('生成旅行方案失败:', error);
  }
}

// 重置表单
const resetForm = () => {
  currentStep.value = 0
  showSuccess.value = false
  
  // 重置表单数据
  formData.province = ''
  formData.city = ''
  formData.startDate = ''
  formData.endDate = ''
  formData.minBudget = ''
  formData.maxBudget = ''
  
  // 跳转到个人中心
  router.push('/profile')
  formData.adultCount = 1
  formData.childCount = 0
  formData.remark = ''
  
  // 清空错误
  Object.keys(errors).forEach(key => delete errors[key])
}

// 组件挂载时初始化登录状态并检查
onMounted(() => {
  // 初始化登录状态
  loginStore.initializeAuth()
  
  // 检查是否已登录
  if (!loginStore.isAuthenticated()) {
    // 未登录时显示登录弹窗
    showLoginModal.value = true
  }
})

// 处理登录成功
const handleLoginSuccess = () => {
  showLoginModal.value = false
}

// 关闭登录弹窗时的处理
const handleCloseLoginModal = () => {
  showLoginModal.value = false
  // 如果未登录，跳转到首页
  if (!loginStore.isAuthenticated()) {
    router.push('/about')
  }
}
</script>

<style scoped>
/* 渐变移动动画 */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
  letter-spacing: -1px;
  display: inline-block;
  line-height: 1.2;
}
.gradient-text {
  background: linear-gradient(
    90deg,
    #667eea, /* 紫蓝色 */
    #764ba2, /* 紫色 */
    #667eea, /* 紫蓝色 */
    #764ba2, /* 紫色 */
    #667eea  /* 紫蓝色 */
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  /* display: inline-block;
  margin-left: auto;
  margin-right: auto; */
  color: transparent;
  animation: gradientShift 8s ease infinite;
}

.form-page {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  width: 100%;
  max-width: 800px;
}

.page-title {
  /* background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  animation: gradientShift 8s ease infinite;
}

.page-description {
  text-align: center;
  color: #474747;
  margin-bottom: 2rem;
}

/* 进度指示器 */
.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
}

.step-indicator {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #474747;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step-indicator.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-indicator.completed {
  background: #4CAF50;
  color: white;
}

/* 表单样式 */
.form-container {
  min-height: 400px;
}

.form-step {
  animation: fadeIn 0.5s ease;
}

.step-title {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.8rem;
  text-align: center;
  background: linear-gradient(90deg, #4c5375 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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

.required {
  color: #e74c3c;
  font-size: 1rem;
}

.glass-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.glass-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.3);
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* 级联选择器样式 */
.cascade-select {
  display: flex;
  gap: 1rem;
}

.province-select,
.city-select {
  flex: 1;
}

/* 日期范围样式 */
.date-range {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.date-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

/* 预算范围样式 */
.budget-range {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.budget-item {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1rem;
  z-index: 1;
}

.budget-input {
  padding-left: 2rem;
}

/* 出行人数样式 */
.people-count {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.people-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.people-label {
  font-size: 1rem;
  color: #666;
  min-width: 50px;
}

.people-input {
  flex: 1;
}

/* 服务选项样式 */
.service-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-item:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: #667eea;
}

.service-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  cursor: pointer;
}

.service-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.service-name {
  font-size: 1rem;
  color: #333;
}

/* 定制师数量样式 */
.customizer-count {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

.radio-item input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  cursor: pointer;
}

/* 联系方式样式 */
.contact-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.contact-title {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.3rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group.half {
  flex: 1;
  min-width: 200px;
}

/* 确认信息样式 */
.confirm-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.confirm-section h3 {
  margin-bottom: 1rem;
  color: #667eea;
  font-size: 1.2rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  padding-bottom: 0.5rem;
}

.confirm-item {
  display: flex;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.confirm-label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
  flex-shrink: 0;
}

.confirm-value {
  color: #333;
  flex: 1;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
}

.btn-primary.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #474747;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100px);
  opacity: 0;
}

/* 成功弹窗 */
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4CAF50;
  color: white;
  font-size: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-page {
    padding: 1rem;
  }
  
  .glass-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .cascade-select,
  .date-range,
  .budget-range,
  .people-count,
  .customizer-count {
    flex-direction: column;
  }
  
  .service-options {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-group.half {
    min-width: 100%;
  }
  
  .confirm-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .confirm-label {
    margin-bottom: 0.25rem;
  }
}
</style>