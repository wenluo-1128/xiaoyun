<template>
  <div class="about-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-pattern"></div>
      </div>
      <!-- 中文文字装饰层（移到外层，确保可以响应鼠标） -->
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


      <div class="hero-content">
        <div class="glass-card hero-card fade-in">
          <h1 class="hero-title gradient-text">智绘专属个性化旅途</h1>
          <p class="hero-subtitle">告别千篇一律的旅行，开启专属于您的完美旅程</p>
          
          <div class="hero-cta">
            <router-link to="/form" class="btn btn-primary" aria-label="开始定制">
              开始定制 <Icon icon="carbon:arrow-right" />
            </router-link>
            <router-link to="/ai-chat" class="btn btn-secondary" aria-label="智能咨询">
              智能咨询 <Icon icon="carbon:chat" />
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  position: relative;
  transform: translateY(-40px); /* 向上偏移 40px */
}

/* 英雄区域 */
.hero-section {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-background {
  position: absolute;
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

/* 中文文字装饰层 */
.hero-text-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: auto;
  overflow: visible;
  z-index: 5;
}

.text-decor {
  position: absolute;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.15;
  color: var(--color-primary);
  user-select: none;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-origin: center center;
  transform: rotate(var(--rotation, 0deg));
  will-change: transform, opacity;
}

.text-decor:hover {
  opacity: 0.3;
  transform: rotate(var(--rotation, 0deg)) scale(1.08) translateY(-3px);
  color: #305b83;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
  cursor: pointer;
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

.hero-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
}

.hero-card {
  background: var(--white-transparent-10);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--white-transparent-18);
  padding: 4rem 3rem;
  text-align: center;
  box-shadow: var(--shadow-heavy);
  max-width: 800px;
  position: relative;
  overflow: hidden;
  transition: var(--transition-fast);
  z-index: 10;
}

.hero-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.hero-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shine 6s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.hero-title {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  display: inline-block;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

/* 渐变流光效果 */
.hero-title.gradient-text,
.gradient-text {
  background: var(--gradient-primary);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientShift 8s ease infinite;
}

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

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
  line-height: 1.6;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.btn {
  padding: 1.25rem 2.5rem;
  border: none;
  border-radius: var(--radius-large);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--transition-fast);
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: var(--gradient-primary);
  color: var(--white);
  box-shadow: var(--shadow-light);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.btn-secondary {
  background: var(--white-transparent-20);
  color: var(--text-secondary);
  border: 1px solid var(--white-transparent-30);
}

.btn-secondary:hover {
  background: var(--white-transparent-30);
  transform: translateY(-3px);
  box-shadow: var(--shadow-light);
}

/* 响应式设计 */
/* 小屏幕（手机，<768px）：只显示核心标语 */
@media (max-width: 767px) {
  .show-md-up,
  .show-lg-up {
    display: none;
  }
  
  .hero-section {
    padding: 1rem;
  }
  
  .hero-card {
    padding: 3rem 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-features {
    gap: 1rem;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  /* 核心标语字体大小调整 */
  .text-left-large {
    font-size: clamp(2.5rem, 8vw, 4rem);
  }
  
  .text-right {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
}

/* 中等屏幕（平板，768px-1023px）：显示核心标语 + 中等标语 */
@media (min-width: 768px) and (max-width: 1488px) {
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

/* 大屏幕（桌面，>=1024px）：显示所有标语 */
@media (min-width: 1488px) {
  .show-md-up,
  .show-lg-up {
    display: block;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
}
</style>