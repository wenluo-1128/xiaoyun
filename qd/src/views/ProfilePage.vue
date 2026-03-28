<template>
  <div class="profile-page">
    <!-- 登录弹窗 -->
    <LoginModal 
      :visible="showLoginModal" 
      @close="handleCloseLoginModal"
      @login-success="handleLoginSuccess"
    />
    <!-- 固定背景层（占满视口，不随内容滚动） -->
    <div class="hero-background">
      <div class="hero-pattern"></div>
    </div>
    <!-- 中文文字装饰层（静态展示，无交互） -->
    <div class="hero-text-decoration">
      <!-- 核心标语（所有屏幕都显示） -->
      <span class="text-decor text-left-large" style="--rotation: -6deg; top: 8%; left: 45%;">智绘旅程</span>
      <span class="text-decor text-left-large" style="--rotation: -5deg; top: 15%; left: 2%;">奔赴山海</span>
      <span class="text-decor text-right" style="--rotation: 15deg; top: 5%; right: 0%;">专属轨迹</span>
      <span class="text-decor text-left-large" style="--rotation: 3deg; top: 65%; left: 1%;">心之所向，步履皆往</span>
      
      <!-- 中等屏幕及以上显示（平板和桌面） -->
      <span class="text-decor text-left show-md-up" style="--rotation: 3deg; top: 5%; left: 25%;">算法知你心</span>
      <span class="text-decor text-right-small show-md-up" style="--rotation: -8deg; top: 12%; left: 5%;">精心设计</span>
      <span class="text-decor text-right show-md-up" style="--rotation: -10deg; top: 18%; right: 5%;">智能规划</span>
      <span class="text-decor text-left show-md-up" style="--rotation: 18deg; top: 40%; left: 45%;">不想做攻略？交给 AI</span>
      <span class="text-decor text-left-large show-md-up" style="--rotation: -12deg; top: 45%; left: 3%;">创意规划</span>
      <span class="text-decor text-right show-md-up" style="--rotation: 10deg; top: 42%; right: 2%;">独具匠心</span>
      <span class="text-decor text-right show-md-up" style="--rotation: -6deg; top: 50%; right: 15%;">定制化</span>
      <span class="text-decor text-right-small show-md-up" style="--rotation: 12deg; top: 28%; right: 3%;">比你更懂你的旅行搭子</span>
      <span class="text-decor text-right-small show-md-up" style="--rotation: -15deg; top: 62%; right: 4%;">不虚此行</span>
      <span class="text-decor text-left show-md-up" style="--rotation: 18deg; bottom: 80%; left: 0%;">出发就现在</span>
      
      <!-- 仅大屏幕显示（桌面） -->
      <span class="text-decor text-right-small show-lg-up" style="--rotation: 5deg; top: 5%; right: 18%;">定制未来，从点击开始</span>
      <span class="text-decor text-right-small show-lg-up" style="--rotation: 7deg; top: 60%; right: 6%;">一键生成你的梦中情旅</span>
      <span class="text-decor text-right-small show-lg-up" style="--rotation: 10deg; top: 75%; right: 5%;">定制每一程</span>
      <span class="text-decor text-right show-lg-up" style="--rotation: 5deg; bottom: 10%; right: 75%;">智绘旅程</span>
      <span class="text-decor text-left show-lg-up" style="--rotation: 10deg; bottom: 8%; left: 35%;">美食不踩雷</span>
      <span class="text-decor text-right-small show-lg-up" style="--rotation: -10deg; bottom: 5%; right: 25%;">排队不用愁</span>
      <span class="text-decor text-right show-lg-up" style="--rotation: 8deg; bottom: 55%; right: 75%;">景点个性推</span>
      <span class="text-decor text-left show-lg-up" style="--rotation: 6deg; bottom: 10%; left: 75%;">旅途更尽兴</span>
      <span class="text-decor text-right show-lg-up" style="--rotation: -11deg; top: 35%; right: 15%;">智能更懂你</span>
    </div>
    
    <!-- 内容 -->
     <div class="content1">
      <!-- 用户信息卡片 -->
    <section class="user-info-section">
      <div class="glass-card user-card">
        <div class="user-header">
          <div class="avatar-container">
            <div class="avatar-circle user">
              <Icon icon="carbon:user" class="avatar-icon" />
            </div>
            <!-- <div class="avatar-badge">
              <Icon icon="carbon:camera" />
            </div> -->
          </div>
          <div class="user-details">
            <h1 class="user-name">{{ userName }}</h1>

            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">{{ historyPlans.length }}</span>
                <span class="stat-label">已完成旅行</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ ongoingPlans.length }}</span>
                <span class="stat-label">进行中方案</span>
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
              <Icon icon="carbon:locked" class="setting-icon" />
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
              <Icon icon="carbon:phone" class="setting-icon" />
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

// 用户名
const userName = ref('旅行者')

// 进行中方案数据
const ongoingPlans = ref([]);

// 从接口获取旅行计划数组
const loadTravelPlans = async () => {
  console.log('diaoyong11111111111111111111111111111111111111')
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
    
    // 发送POST请求
    const response = await fetch(`${API_BASE_URL}/api/user-info/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userid: parseInt(userid) })
    });
    console.log(response.data)
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data)
    
    // 处理返回的数据
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      // 为每个方案添加图片信息和必要的字段，并映射接口字段到页面所需字段
      const plansWithImage = data.data.map(plan => ({
        ...plan,
        title: plan.theme, // 使用query_keyword作为title
        dates: plan.depart_time, // 使用depart_time作为dates
        peopleCount: plan.the_count, // 使用the_count作为peopleCount
        image: 'https://via.placeholder.com/400x200?text=Travel+Plan', // 添加默认图片
        status: '进行中' // 初始状态设为进行中，后续由queryPlanStatus更新
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
      // 使用当前进行中的方案列表
      const currentPlans = [...ongoingPlans.value, ...historyPlans.value];
      
      // 创建新的方案数组（包含所有方案，更新状态）
      const updatedPlans = [];
      const newOngoingPlans = [];
      
      // 遍历当前方案
      for (const plan of currentPlans) {
        // 如果已经标记为已完成，直接跳过，不显示在进行中
        if (plan.status === '已完成') {
          updatedPlans.push(plan);
          continue;
        }
        
        // 查找接口返回中是否有匹配的id
        const matchingApiItem = data.data.find(apiItem => 
          String(apiItem.codeid) === String(plan.query_keyword)
        );
        console.log(matchingApiItem)
        if (matchingApiItem) {
          // 有匹配的方案，根据json和html是否为空判断状态，并存储codeid
          const planWithCodeid = { 
            ...plan, 
            codeid: matchingApiItem.codeid // 存储codeid
          };
          
          if (matchingApiItem.json !== null && matchingApiItem.html !== null) {
            // 方案已完成，添加到历史方案
            const completedPlan = { ...planWithCodeid, status: '已完成' };
            // 检查历史方案中是否已存在
            const existingHistoryIds = new Set(historyPlans.value.map(p => String(p.id)));
            if (!existingHistoryIds.has(String(completedPlan.id))) {
              historyPlans.value.unshift(completedPlan);
            }
            updatedPlans.push(completedPlan);
          } else {
            // 方案仍在进行中，添加到进行中方案
            const ongoingPlan = { ...planWithCodeid, status: '进行中' };
            newOngoingPlans.push(ongoingPlan);
            updatedPlans.push(ongoingPlan);
          }
        } else {
          // 没有匹配的接口数据，删除该方案
          console.log('删除方案，接口中没有对应的id:', plan.id);
        }
      }
      
      // 更新进行中方案列表
      ongoingPlans.value = newOngoingPlans;
      console.log('-----------------', ongoingPlans.value);
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

// 从本地存储获取用户名
const loadUserName = () => {
  try {
    // 获取localStorage中的用户数据
    const userStr = localStorage.getItem('user');
    if (userStr) {
      // 解析JSON字符串为JavaScript对象
      const userObj = JSON.parse(userStr);
      // 提取name（根据实际数据结构获取）
      if (userObj.data?.name) {
        userName.value = userObj.data.name;
      }
    }
  } catch (e) {
    console.error('解析用户数据失败:', e);
  }
};

// 生命周期
onMounted(async () => {
  // 初始化登录状态
  loginStore.initializeAuth()
  
  // 加载用户名
  loadUserName();
  
  // 检查是否已登录
  if (!loginStore.isAuthenticated()) {
    // 未登录时显示登录弹窗
    showLoginModal.value = true
  } else {
    // 已登录时加载旅行计划信息并查询状态
    await loadTravelPlans();
    // 页面一进入就查询对应标签的方案状态，无论哪个标签都调用进行中接口
    await queryPlanStatus();
  }
  
  window.addEventListener('scroll', handleScroll)
  handleScroll() // 初始检查
})

// 处理登录成功
const handleLoginSuccess = () => {
  showLoginModal.value = false
  // 登录成功后加载用户名
  loadUserName();
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
  // 原代码注释
  /*
  const baseUrl = ''; // 基地址先空着，后续填入
  const redirectUrl = `${baseUrl}?query_keyword=${plan.codeid}`;
  
  console.log('准备跳转到:', redirectUrl);
  // 在新标签页打开URL
  window.open(redirectUrl, '_blank');
  */
  // 新跳转代码
  const redirectUrl = `/route-planner?query_keyword=${plan.codeid}`;
  
  console.log('准备跳转到:', redirectUrl);
  // 在新标签页打开URL
  window.open(redirectUrl, '_blank');
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 固定背景层（占满视口，不随内容滚动） */
.profile-page {
  position: relative;
  transform: translateY(-20px); /* 向上偏移 20px */
  min-height: 100vh;
  overflow: hidden;
}

.content1 {
  width: 100%;
  height: 100vh;
  overflow: auto;
  padding: 2rem;
  padding-bottom: 80px;
}

.hero-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.1) 100%);
  z-index: -1;
  overflow: hidden;
}

/* 几何图形装饰 */
.hero-background::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 50px,
      rgba(52, 152, 219, 0.03) 50px,
      rgba(52, 152, 219, 0.03) 51px
    );
  animation: geometricFloat 60s linear infinite;
  pointer-events: none;
}

.hero-background::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 50px,
      rgba(52, 152, 219, 0.02) 50px,
      rgba(52, 152, 219, 0.02) 51px
    );
  animation: geometricFloat 40s linear infinite reverse;
  pointer-events: none;
}

@keyframes geometricFloat {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--white-transparent-10) 0%, transparent 20%),
    radial-gradient(circle at 80% 50%, var(--white-transparent-10) 0%, transparent 30%),
    radial-gradient(circle at 40% 80%, var(--white-transparent-10) 0%, transparent 25%),
    radial-gradient(circle at 70% 20%, var(--white-transparent-10) 0%, transparent 15%);
  animation: floatBackground 20s ease-in-out infinite;
}

@keyframes floatBackground {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* 中文文字装饰层（静态展示，无交互） */
.hero-text-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* 禁用鼠标交互 */
  overflow: visible;
  z-index: 0;
}

.text-decor {
  position: absolute;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.15;
  color: var(--color-primary);
  user-select: none;
  transform-origin: center center;
  transform: rotate(var(--rotation, 0deg));
}

/* 左侧大字号文字 */
.text-left-large {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(4rem, 10vw, 8rem);
}

/* 左侧中等字号文字 */
.text-left {
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
}

/* 右侧中等字号文字 */
.text-right {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

/* 右侧小字号文字 */
.text-right-small {
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

/* 通用样式 */
.glass-card {
  background: var(--white-transparent-10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--white-transparent-18);
  box-shadow: var(--shadow-heavy);
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  background: var(--gradient-primary);
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
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--gradient-primary);
  color: var(--white);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-secondary {
  background: var(--white-transparent-20);
  color: var(--text-secondary);
  border: 1px solid var(--white-transparent-30);
}

.btn-secondary:hover {
  background: var(--white-transparent-30);
  transform: translateY(-2px);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
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

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  /* border: 4px solid var(--color-primary); */
}

.avatar-circle.user {
  background: var(--gradient-primary);
}

.avatar-icon {
  font-size: 3rem;
  color: var(--white);
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: var(--white);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.avatar-badge:hover {
  transform: scale(1.1);
}

.user-name {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.user-level {
  color: var(--color-primary);
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
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--bg-overlay-light);
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
  background: var(--white-transparent-20);
  border: 1px solid var(--white-transparent-30);
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition-fast);
  font-weight: 500;
}

.tab-button.active {
  background: var(--gradient-primary);
  color: var(--white);
  border-color: transparent;
}

.tab-button:hover:not(.active) {
  background: var(--white-transparent-30);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.plan-card {
  overflow: hidden;
  transition: var(--transition-fast);
}

.plan-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-title {
  margin: 0;
  color: var(--text-primary);
}

.plan-status {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  background: rgba(52, 152, 219, 0.2);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 500;
}

.plan-status.completed {
  background: var(--success-color-bg);
  color: var(--success-color);
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
  color: var(--text-secondary);
}

.detail-icon {
  color: var(--color-primary);
  font-size: 1.1rem;
}

.favorite-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--danger-color);
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
  background: var(--white-transparent-10);
  border-radius: var(--radius-large);
  padding: 1.5rem;
  text-align: center;
  transition: var(--transition-fast);
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
  color: var(--primary-color-start);
  margin-bottom: 1rem;
}

.benefit-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.benefit-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.membership-progress {
  background: var(--white-transparent-10);
  border-radius: var(--radius-large);
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.points-needed {
  color: var(--primary-color-start);
}

.progress-bar {
  height: 10px;
  background: var(--white-transparent-30);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.8s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  color: var(--text-primary);
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
  transition: var(--transition-fast);
}

.setting-item:hover {
  background: var(--white-transparent-20);
}

.setting-icon {
  color: var(--primary-color-start);
  margin-right: 1rem;
  font-size: 1.2rem;
}

.arrow-icon {
  margin-left: auto;
  color: var(--text-lighter);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .show-md-up,
  .show-lg-up {
    display: none;
  }
  
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
  
  /* 核心标语字体大小调整 */
  .text-left-large {
    font-size: clamp(2.5rem, 8vw, 4rem);
  }
  
  .text-right {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
  }
}

/* 中等屏幕（平板，768px-1487px）：显示核心标语 + 中等标语 */
@media (min-width: 768px) and (max-width: 1487px) {
  .show-lg-up {
    display: none;
  }
  
  .show-md-up {
    display: block;
  }
  
  /* 调整平板上的标语位置，避免拥挤 */
  .text-decor.show-md-up {
    opacity: 0.12;
  }
}

/* 大屏幕（桌面，>=1488px）：显示所有标语 */
@media (min-width: 1488px) {
  .show-md-up,
  .show-lg-up {
    display: block;
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