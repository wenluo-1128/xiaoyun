<template>
  <div class="profile-page">
    <!-- 登录弹窗 -->
    <LoginModal 
      :visible="showLoginModal" 
      @close="handleCloseLoginModal"
      @login-success="handleLoginSuccess"
    />
    <!-- 用户信息卡片 -->
    <section class="user-info-section">
      <div class="glass-card user-card">
        <div class="user-header">
          <div class="avatar-container">
            <img src="/fj1.jpg" alt="用户头像" class="user-avatar" />
            <div class="avatar-badge">
              <Icon icon="carbon:camera" />
            </div>
          </div>
          <div class="user-details">
            <h1 class="user-name">旅行者小明</h1>
  
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">5</span>
                <span class="stat-label">已完成旅行</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">2</span>
                <span class="stat-label">进行中方案</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">4.9</span>
                <span class="stat-label">平均评分</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
    
    <!-- 旅行方案管理 -->
    <section class="travel-plans-section">
      <div class="section-header">
        <div class="plan-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            class="tab-button"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <!-- 进行中方案 -->
      <div v-if="activeTab === 'ongoing'" class="plans-grid">
        <div 
          v-for="plan in ongoingPlans" 
          :key="plan.id"
          class="plan-card glass-card hover-lift"
        >
          <div class="plan-header">
            <h3 class="plan-title">{{ plan.title }}</h3>
            <span class="plan-status">进行中</span>
          </div>
          <div class="plan-details">
            <div class="detail-item">
              <Icon icon="carbon:location" class="detail-icon" />
              <span>{{ plan.destination }}</span>
            </div>
            <div class="detail-item">
              <Icon icon="carbon:calendar" class="detail-icon" />
              <span>{{ plan.dates }}</span>
            </div>
            <div class="detail-item">
              <Icon icon="carbon:user" class="detail-icon" />
              <span>{{ plan.peopleCount }}</span>
            </div>
            <div class="detail-item">
              <Icon icon="carbon:currency" class="detail-icon" />
              <span>¥{{ plan.budget }}</span>
            </div>
          </div>
          <div class="plan-actions">
            <button class="btn btn-primary btn-small">
              方案正在生成中
              <Icon icon="carbon:loading-four" class="loading-icon animate-spin text-inherit" /> 
            </button>
          </div>
        </div>
      </div>
      
      <!-- 历史方案 -->
      <div v-else-if="activeTab === 'history'" class="plans-grid">
        <div 
          v-for="plan in historyPlans" 
          :key="plan.id"
          class="plan-card glass-card hover-lift"
        >
          <div class="plan-header">
            <h3 class="plan-title">{{ plan.title }}</h3>
            <span class="plan-status completed">{{ plan.status }}</span>
          </div>
          <div class="plan-details">
            <div class="detail-item">
              <Icon icon="carbon:location" class="detail-icon" />
              <span>{{ plan.destination }}</span>
            </div>
            <div class="detail-item">
              <Icon icon="carbon:calendar" class="detail-icon" />
              <span>{{ plan.dates }}</span>
            </div>
            <div class="detail-item">
              <Icon icon="carbon:user" class="detail-icon" />
              <span>{{ plan.peopleCount }}</span>
            </div>
            <div class="detail-item">
              <Icon icon="carbon:currency" class="detail-icon" />
              <span>¥{{ plan.budget }}</span>
            </div>
          </div>
          <div class="plan-actions">
            <button class="btn btn-secondary btn-small" @click="handleViewCustomization(plan)">
              查看定制
            </button>
          </div>
        </div>
      </div>
      

    </section>
    
    <!-- 设置和帮助 -->
    <section class="settings-section">
      <div class="settings-grid">
        <div class="settings-card glass-card">
          <h3 class="settings-title">账户设置</h3>
          <div class="settings-list">
            <div class="setting-item">
              <Icon icon="carbon:user" class="setting-icon" />
              <span>个人信息</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
            <div class="setting-item">
              <Icon icon="carbon:lock" class="setting-icon" />
              <span>账户安全</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
            <div class="setting-item">
              <Icon icon="carbon:email" class="setting-icon" />
              <span>通知设置</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
            <div class="setting-item">
              <Icon icon="carbon:language" class="setting-icon" />
              <span>语言偏好</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
          </div>
        </div>
        
        <div class="settings-card glass-card">
          <h3 class="settings-title">帮助与支持</h3>
          <div class="settings-list">
            <div class="setting-item">
              <Icon icon="carbon:help" class="setting-icon" />
              <span>常见问题</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
            <div class="setting-item">
              <Icon icon="carbon:chat" class="setting-icon" />
              <span>在线客服</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
            <div class="setting-item">
              <Icon icon="carbon:call" class="setting-icon" />
              <span>电话咨询</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
            <div class="setting-item">
              <Icon icon="carbon:document" class="setting-icon" />
              <span>服务条款</span>
              <Icon icon="carbon:chevron-right" class="arrow-icon" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '../stores/loginStore.js'
import LoginModal from '../components/LoginModal.vue'
import { API_BASE_URL, API_ENDPOINTS } from '../config.js'

// 登录状态管理
const router = useRouter()
const loginStore = useLoginStore()
const showLoginModal = ref(false)

// 状态管理
const activeTab = ref('ongoing')
const tabs = [
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'history' }
]



// 进行中方案数据
const ongoingPlans = ref([]);

// 从localStorage获取旅行计划数组
const loadTravelPlans = () => {
  try {
    const storedPlans = localStorage.getItem('travelPlans');
    if (storedPlans) {
      const plansData = JSON.parse(storedPlans);
      // 为每个方案添加图片信息（如果不存在）
      const plansWithImage = plansData.map(plan => ({
        ...plan,
        image: plan.image || 'https://via.placeholder.com/400x200?text=Travel+Plan',
        id: plan.id || Date.now() + Math.random() // 确保每个方案都有ID
      }));
      
      // 只显示非已完成状态的方案
      ongoingPlans.value = plansWithImage.filter(plan => plan.status !== '已完成');
      
      // 将已完成的方案添加到历史方案列表
      const completedPlans = plansWithImage.filter(plan => plan.status === '已完成');
      const existingHistoryIds = new Set(historyPlans.value.map(plan => String(plan.id)));
      completedPlans.forEach(plan => {
        if (!existingHistoryIds.has(String(plan.id))) {
          historyPlans.value.unshift(plan);
        }
      });
    }
  } catch (error) {
    console.error('加载旅行计划失败:', error);
  }
};

// 查询方案状态
const queryPlanStatus = async () => {
  try {
      // 从本地存储中获取用户ID
      let userid = '12'; // 设置默认值
      try {
        // 获取localStorage中的数据
        const userStr = localStorage.getItem('user');
        if (userStr) {
          // 解析JSON字符串为JavaScript对象
          const userObj = JSON.parse(userStr);
          // 提取id（根据实际数据结构获取）
          userid = userObj.data?.id;
        }
      } catch (e) {
        console.error('解析用户数据失败:', e);
      }
      // 构建查询参数
      const params = new URLSearchParams({
        user_id: userid
      });
    
    // 发送GET请求
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QUERY_FORM}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 根据返回结果处理方案状态
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      // 获取本地存储的方案数组
      const storedPlans = JSON.parse(localStorage.getItem('travelPlans') || '[]');
      
      // 创建新的方案数组（包含所有方案，更新状态）
      const updatedPlans = [];
      const newOngoingPlans = [];
      
      // 遍历本地存储的方案
      for (const storedPlan of storedPlans) {
        // 如果已经标记为已完成，直接跳过，不显示在进行中
        if (storedPlan.status === '已完成') {
          updatedPlans.push(storedPlan);
          continue;
        }
        
        // 查找接口返回中是否有匹配的id
        const matchingApiItem = data.data.find(apiItem => 
          String(apiItem.id) === String(storedPlan.id)
        );
        console.log(matchingApiItem)
        if (matchingApiItem) {
          // 有匹配的方案，根据json和html是否为空判断状态，并存储codeid
          const planWithCodeid = { 
            ...storedPlan, 
            codeid: matchingApiItem.codeid // 存储codeid
          };
          
          if (matchingApiItem.json !== null && matchingApiItem.html !== null) {
            // 方案已完成，添加到历史方案
            const completedPlan = { ...planWithCodeid, status: '已完成' };
            historyPlans.value.unshift(completedPlan);
            updatedPlans.push(completedPlan);
          } else {
            // 方案仍在进行中，添加到进行中方案
            const ongoingPlan = { ...planWithCodeid, status: '进行中' };
            newOngoingPlans.push(ongoingPlan);
            updatedPlans.push(ongoingPlan);
          }
        } else {
          // 没有匹配的接口数据，删除该本地方案
          console.log('删除本地方案，接口中没有对应的id:', storedPlan.id);
        }
      }
      
      // 更新进行中方案列表
      ongoingPlans.value = newOngoingPlans;
      console.log('-----------------', ongoingPlans.value);
      // 更新本地存储中的方案数组（包含所有方案，包括已完成和codeid）
      localStorage.setItem('travelPlans', JSON.stringify(updatedPlans));
    }
    // 如果返回为空，则保持进行中方案不变
    
  } catch (error) {
    console.error('查询方案状态失败:', error);
    // 错误情况下保持现有状态，不影响用户体验
  }
};

// 历史方案数据 - 使用ref使其可响应式更新
const historyPlans = ref([]);

// 已删除已完成接口查询函数，状态判断和codeid获取统一在queryPlanStatus中处理

// 监听activeTab变化，切换到相应标签时触发查询
watch(activeTab, (newTab) => {
  if (newTab === 'ongoing') {
    queryPlanStatus();
  } else if (newTab === 'history') {
    // 切换到历史标签时，也调用进行中接口进行状态判断
    queryPlanStatus();
  }
});





// 滚动动画处理
const handleScroll = () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll')
  
  animatedElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top
    const elementVisible = 150
    
    if (elementTop < window.innerHeight - elementVisible) {
      el.classList.add('animated')
    }
  })
}

// 生命周期
onMounted(() => {
  // 初始化登录状态
  loginStore.initializeAuth()
  
  // 检查是否已登录
  if (!loginStore.isAuthenticated()) {
    // 未登录时显示登录弹窗
    showLoginModal.value = true
  } else {
    // 已登录时加载旅行计划信息并查询状态
    loadTravelPlans();
    // 页面一进入就查询对应标签的方案状态，无论哪个标签都调用进行中接口
    queryPlanStatus();
  }
  
  window.addEventListener('scroll', handleScroll)
  handleScroll() // 初始检查
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

// 处理查看定制按钮点击事件
const handleViewCustomization = (plan) => {
  console.log('方案ID:', plan.id, '的codeid:', plan.codeid);
  
  // 构建跳转URL，使用codeid作为query_keyword参数
  const baseUrl = 'http://172.30.32.1:5173/'; // 基地址先空着，后续填入
  const redirectUrl = `${baseUrl}?query_keyword=${plan.codeid}`;
  
  console.log('准备跳转到:', redirectUrl);
  // 在新标签页打开URL
  window.open(redirectUrl, '_blank');
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 2rem;
}

/* 通用样式 */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
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

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
}

/* 用户信息卡片 */
.user-info-section {
  margin-bottom: 3rem;
}

.user-card {
  padding: 2rem;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #667eea;
  object-fit: cover;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-badge:hover {
  transform: scale(1.1);
}

.user-name {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-level {
  color: #667eea;
  font-weight: 500;
  margin: 0 0 1rem 0;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #474747;
  font-size: 0.9rem;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(0, 0, 0, 0.1);
}

.user-actions {
  display: flex;
  gap: 1rem;
}

/* 旅行方案管理 */
.travel-plans-section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 2rem;
}

.plan-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.tab-button {
  padding: 0.8rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-button.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.3);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.plan-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.plan-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-title {
  margin: 0;
  color: #333;
}

.plan-status {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
}

.plan-status.completed {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.plan-image {
  height: 200px;
  overflow: hidden;
}

.plan-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plan-card:hover .plan-image img {
  transform: scale(1.05);
}

.plan-details {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #474747;
}

.detail-icon {
  color: #667eea;
  font-size: 1.1rem;
}

.favorite-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #ff4757;
  font-size: 1.2rem;
}

.favorite-icon {
  font-size: 1.2rem;
}

.plan-actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
}

/* 会员权益 */
.membership-section {
  margin-bottom: 3rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.benefit-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.benefit-card.animated {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.benefit-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.benefit-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.benefit-description {
  color: #474747;
  font-size: 0.9rem;
}

.membership-progress {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #333;
}

.points-needed {
  color: #667eea;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.8s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #474747;
}

/* 设置和帮助 */
.settings-section {
  margin-bottom: 3rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.settings-card {
  padding: 2rem;
}

.settings-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.setting-icon {
  color: #667eea;
  margin-right: 1rem;
  font-size: 1.2rem;
}

.arrow-icon {
  margin-left: auto;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-actions {
    justify-content: center;
  }
  
  .plan-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>