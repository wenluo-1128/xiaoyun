<template>
  <div class="form-page">
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
    
    <div class="glass-card form-container">
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const newApiKey = import.meta.env.VITE_API_KEY_3;
    
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
    const secondApiKey = import.meta.env.VITE_API_KEY_2;
    const API_BASE_URL = '/api';
    const ApiKey = import.meta.env.VITE_API_KEY_1
           
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

     // 发送POST请求
    const response = await fetch('/api/user-info/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userid: userid,
        query_keyword: keyword,
        theme: travelPlanInfo.title,
        depart_time: travelPlanInfo.dates,
        destination: travelPlanInfo.destination,
        the_count: travelPlanInfo.peopleCount,
        budget: travelPlanInfo.budget
      })
    })
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    const data = await response.json()
    console.log('响应数据:', data)



    
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
  background: var(--gradient-primary);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientShift 8s ease infinite;
}

/* 固定背景层（占满视口，不随内容滚动） */
.form-page {
  position: relative;
  min-height: 100vh;
  padding: 8rem;
  padding-top: 1rem;
  /* display: flex;
  justify-content: center; */
  /* align-items: center; */
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
  top: 4rem;
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

.glass-card {
  background: var(--white-transparent-10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--white-transparent-18);
  padding: 2rem;
  box-shadow: var(--shadow-heavy);
  width: 100%;
  max-width: 800px;
}

.form-container {
  margin: 0 auto;
}

.page-title {
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
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* 进度指示器 */
.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 5px;
  background: var(--white-transparent-30);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
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
  background: var(--white-transparent-30);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-weight: bold;
  transition: var(--transition-fast);
}

.step-indicator.active {
  background: var(--gradient-primary);
  color: var(--white);
}

.step-indicator.completed {
  background: var(--success-color);
  color: var(--white);
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
  color: var(--text-primary);
  font-size: 1.8rem;
  text-align: center;
  background: linear-gradient(90deg, #4c5375 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: var(--color-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.required {
  color: var(--danger-color-alt);
  font-size: 1rem;
}

.glass-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: var(--white-transparent-20);
  border: 1px solid var(--white-transparent-30);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition-fast);
  backdrop-filter: blur(5px);
}

.glass-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  background: var(--white-transparent-30);
}

.error-message {
  color: var(--danger-color-alt);
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
  color: var(--text-tertiary);
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
  color: var(--text-tertiary);
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
  color: var(--text-tertiary);
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
  background: var(--white-transparent-20);
  border-radius: 10px;
  cursor: pointer;
  transition: var(--transition-fast);
  border: 2px solid transparent;
}

.service-item:hover {
  background: var(--white-transparent-30);
  border-color: var(--color-primary);
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
  color: var(--text-primary);
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
  background: var(--white-transparent-20);
  border-radius: 8px;
  transition: var(--transition-fast);
}

.radio-item:hover {
  background: var(--white-transparent-30);
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
  border-top: 1px solid var(--white-transparent-30);
}

.contact-title {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
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
  background: var(--white-transparent-10);
  border-radius: 15px;
  border: 1px solid var(--white-transparent-20);
}

.confirm-section h3 {
  margin-bottom: 1rem;
  color: var(--color-primary);
  font-size: 1.2rem;
  border-bottom: 2px solid rgba(52, 152, 219, 0.2);
  padding-bottom: 0.5rem;
}

.confirm-item {
  display: flex;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--white-transparent-10);
}

.confirm-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.confirm-label {
  font-weight: 600;
  color: var(--text-tertiary);
  min-width: 120px;
  flex-shrink: 0;
}

.confirm-value {
  color: var(--text-primary);
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
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--gradient-primary);
  color: var(--white);
}

.btn-primary:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  background: linear-gradient(90deg, #85C1E9 0%, var(--color-primary) 100%);
}

.btn-primary.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: var(--transition-fast);
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
  background: var(--bg-overlay-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--white);
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
  background: var(--success-color);
  color: var(--white);
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
  .show-md-up,
  .show-lg-up {
    display: none;
  }
  
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
</style>