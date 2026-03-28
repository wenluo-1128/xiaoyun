<template>
  <div class="travel-plan-views">
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


    <!-- 内容展示 -->
    <div class="travel-plan-view">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载旅行计划...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchTravelPlan" class="retry-btn">重试</button>
      </div>
      <div v-else-if="travelPlanHtml" class="travel-plan-content" v-html="travelPlanHtml"></div>
      
    </div>

    <button
      class="return-btn"
      @click="handleBackToRoute">返回路线</button>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  userid: {
    type: [String, Number],
    default: null
  },
  codeid: {
    type: String,
    default: null
  }
})

const loading = ref(true)
const error = ref(null)
const travelPlanHtml = ref('')

const handleBackToRoute = () => {
  // 使用codeid作为query_keyword参数跳转到路线展示页面
  const redirectUrl = `/route-planner?query_keyword=${props.codeid}`
  router.push(redirectUrl)
}

const filterStyles = (html) => {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  return html.replace(styleRegex, (match, styleContent) => {
    const filteredRules = styleContent
      .split('}')
      .filter(rule => {
        const selector = rule.trim().split('{')[0].trim()
        return selector.startsWith('.') || selector.startsWith('#') || selector === ''
      })
      .join('}')
    return filteredRules ? `<style>${filteredRules}</style>` : ''
  })
}

const filterButtons = (html) => {
  const buttonRegex = /<button[^>]*>[\s\S]*?<\/button>/gi
  return html.replace(buttonRegex, '')
}

const fetchTravelPlan = async () => {
  if (!props.userid || !props.codeid) {
    error.value = '缺少必要的参数'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL_2
    const response = await fetch(`${apiBaseUrl}/query/html?userid=${props.userid}&query_keyword=${props.codeid}`)

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }

    const data = await response.json()
    travelPlanHtml.value = filterButtons(filterStyles(data.html || ''))
  } catch (err) {
    error.value = err.message || '加载旅行计划失败'
    console.error('获取旅行计划失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTravelPlan()
})
</script>


<style scoped>
.travel-plan-views {
  /* transform: translateY(-20px); */
  position: relative;
  z-index: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 8rem;
padding-top: 0rem;
}

.travel-plan-view {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--color-primary, #3498db);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top-color: var(--color-primary, #3498db);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--color-primary, #3498db);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #2980b9;
}

.travel-plan-content {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--white-transparent-10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--white-transparent-18);
  padding: 2rem;
  padding-top: 0;
  box-shadow: var(--shadow-heavy);
  width: 100%;
}



:deep(.travel-plan-content) {
  color: var(--text-color, #333);
  line-height: 1.8;
}

:deep(.travel-plan-content *) {
  box-sizing: border-box;
}

:deep(.travel-plan-content body) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%);
  min-height: 100vh;
  padding: 0;
  margin: 0;
  line-height: 1.6;
}

:deep(.travel-plan-content .container) {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

:deep(.travel-plan-content .glass-card) {
  margin: 0 auto;
  margin-bottom: 1.25rem;
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

:deep(.travel-plan-content .header) {
  text-align: center;
  margin-bottom: 32px;
  margin-top: 10px;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(155, 89, 182, 0.15));
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

:deep(.travel-plan-content .header h1) {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: var(--color-primary, #3498db);
  margin-bottom: 8px;
  font-weight: 700;
}

:deep(.travel-plan-content .section-title) {
  font-size: 1.4rem;
  color: var(--color-primary, #3498db);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(52, 152, 219, 0.2);
}

:deep(.travel-plan-content .content) {
  color: var(--text-color, #333);
  line-height: 1.8;
}

:deep(.travel-plan-content h3) {
  color: var(--color-primary, #3498db);
  margin: 16px 0 8px;
  font-size: 1.1rem;
}

:deep(.travel-plan-content p) {
  margin: 8px 0;
  color: var(--text-color, #555);
}

:deep(.travel-plan-content ul, .travel-plan-content ol) {
  margin: 12px 0;
  padding-left: 24px;
}

:deep(.travel-plan-content li) {
  margin: 6px 0;
  color: var(--text-color, #555);
}

:deep(.travel-plan-content .info-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding-top: 16px;
}

:deep(.travel-plan-content .info-item) {
  background: rgba(52, 152, 219, 0.05);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary, #3498db);
}

:deep(.travel-plan-content .info-item h3) {
  margin-top: 0;
  color: var(--color-primary, #3498db);
}

/* 地点卡片网格系统 */
:deep(.travel-plan-content .locations-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

:deep(.travel-plan-content .location-card) {
  background: var(--white-transparent-10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--white-transparent-18);
  padding: 1.5rem;
  box-shadow: var(--shadow-heavy);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:deep(.travel-plan-content .location-card:hover) {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

:deep(.travel-plan-content .location-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--primary-transparent-20);
}

:deep(.travel-plan-content .location-header h3) {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.3rem;
  font-weight: 600;
}

:deep(.travel-plan-content .location-header .time-badge) {
  background: var(--primary-transparent-20);
  color: var(--color-primary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-medium);
  font-size: 0.9rem;
  font-weight: 500;
}

:deep(.travel-plan-content .location-details) {
  margin-top: 1rem;
}

:deep(.travel-plan-content .detail-item) {
  margin-bottom: 0.75rem;
  display: flex;
  flex-wrap: wrap;
}

:deep(.travel-plan-content .detail-label) {
  font-weight: 600;
  color: var(--color-primary);
  min-width: 100px;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
}

:deep(.travel-plan-content .detail-value) {
  flex: 1;
  color: var(--text-color, #555);
  line-height: 1.5;
}

:deep(.travel-plan-content .detail-value ul) {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}

:deep(.travel-plan-content .detail-value li) {
  margin: 0.25rem 0;
}

:deep(.travel-plan-content strong) {
  color: var(--color-primary, #3498db);
  font-weight: 600;
}

:deep(.travel-plan-content a) {
  color: var(--color-primary, #3498db);
  text-decoration: none;
}

:deep(.travel-plan-content a:hover) {
  text-decoration: underline;
}

:deep(.travel-plan-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px 0;
}

:deep(.travel-plan-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

:deep(.travel-plan-content th, .travel-plan-content td) {
  padding: 12px;
  text-align: left;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

:deep(.travel-plan-content th) {
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-primary, #3498db);
  font-weight: 600;
}

:deep(.travel-plan-content blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  background: rgba(52, 152, 219, 0.05);
  border-left: 4px solid var(--color-primary, #3498db);
  border-radius: 0 8px 8px 0;
  font-style: italic;
}

:deep(.travel-plan-content code) {
  background: rgba(52, 152, 219, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

:deep(.travel-plan-content pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

:deep(.travel-plan-content pre code) {
  background: none;
  padding: 0;
}

.container {
  padding: 20px;
}

.btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background-color: #0056b3;
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

/* 返回按钮样式 */
.return-btn {
  position: fixed;
  top: 5rem;
  left: 1rem;
  z-index: 100;
  padding: 1rem 1rem;
  background: var(--white-transparent-10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--white-transparent-18);
  border-radius: var(--radius-medium);
  color: var(--color-primary, #3498db);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
}

.return-btn:hover {
  background: var(--white-transparent-20);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

</style>