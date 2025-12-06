<template>
  <div class="about-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="glass-card hero-card">
        <h1 class="hero-title gradient-text">个性化旅游方案定制</h1>
        <p class="hero-subtitle">告别千篇一律的旅行，开启专属于您的完美旅程</p>
        <div class="hero-cta">
          <router-link to="/form" class="btn btn-primary">
            开始定制 <Icon icon="carbon:arrow-right" />
          </router-link>
          <router-link to="/ai-chat" class="btn btn-secondary">
            智能咨询 <Icon icon="carbon:chat" />
          </router-link>
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
}

/* 英雄区域 */
.hero-section {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.hero-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 3rem;
  text-align: center;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
  letter-spacing: -1px;
  display: inline-block;
  line-height: 1.2;
}

/* 渐变流光效果 */
.hero-title.gradient-text,
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
  color: #474747;
  margin-bottom: 2rem;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #474747;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
}
</style>