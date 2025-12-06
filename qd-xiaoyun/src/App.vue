<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="logo">
          <Icon icon="carbon:airplane" class="logo-icon" />
          <span class="logo-text">旅途定制</span>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/about" class="nav-link" active-class="active">首页</router-link>
          <router-link to="/ai-chat" class="nav-link" active-class="active">AI对话</router-link>
          <router-link to="/form" class="nav-link" active-class="active">定制表单</router-link>
          <router-link to="/profile" class="nav-link" active-class="active">个人中心</router-link>
        </div>
        
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <Icon icon="carbon:menu" class="menu-icon" />
        </div>
      </div>
      
      <!-- 移动端菜单 -->
      <transition name="slide">
        <div v-if="mobileMenuOpen" class="mobile-menu">
          <router-link to="/about" class="mobile-nav-link" @click="mobileMenuOpen = false">首页</router-link>
          <router-link to="/ai-chat" class="mobile-nav-link" @click="mobileMenuOpen = false">AI对话</router-link>
          <router-link to="/form" class="mobile-nav-link" @click="mobileMenuOpen = false">定制表单</router-link>
          <router-link to="/profile" class="mobile-nav-link" @click="mobileMenuOpen = false">个人中心</router-link>
        </div>
      </transition>
    </nav>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 - 在AI对话页面隐藏 -->
    <footer v-if="route.path !== '/ai-chat'" class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <div class="footer-logo">
            <Icon icon="carbon:airplane" class="footer-logo-icon" />
            <span class="footer-logo-text">旅途定制</span>
          </div>
          <p class="footer-description">
            专业的AI旅游定制平台，为您打造独一无二的旅行体验
          </p>
          <div class="social-links">
            <a href="#" class="social-link"><Icon icon="carbon:logo-wechat" /></a>
            <a href="#" class="social-link"><Icon icon="carbon:logo-weibo" /></a>
            <a href="#" class="social-link"><Icon icon="carbon:logo-instagram" /></a>
            <a href="#" class="social-link"><Icon icon="carbon:logo-twitter" /></a>
          </div>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li><router-link to="/about">关于我们</router-link></li>
            <li><router-link to="/form">开始定制</router-link></li>
            <li><a href="#">旅游攻略</a></li>
            <li><a href="#">常见问题</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">联系我们</h3>
          <ul class="footer-links">
            <li><Icon icon="carbon:email" class="footer-link-icon" /> contact@lvtu.com</li>
            <li><Icon icon="carbon:call" class="footer-link-icon" /> 400-123-4567</li>
            <li><Icon icon="carbon:location" class="footer-link-icon" /> 北京市朝阳区建国路88号</li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2023 旅途定制 版权所有 | 京ICP备12345678号</p>
      </div>
    </footer>
    
    <!-- 背景动画 -->
    <div class="background-animation"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
  overflow-x: hidden;
}

/* 应用容器 */
.app {
  position: relative;
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #fff;
  font-weight: bold;
  font-size: 1.5rem;
}

.logo-icon {
  font-size: 1.8rem;
  color: #fff;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.8);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.5rem;
}

/* 移动端菜单 */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.mobile-nav-link {
  display: block;
  color: #fff;
  text-decoration: none;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.mobile-nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 主内容区域 */
.main-content {
  padding-top: 80px;
  min-height: calc(100vh - 200px);
}

/* 页脚 */
.footer {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 3rem 0 2rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.footer-logo-icon {
  font-size: 1.8rem;
}

.footer-description {
  line-height: 1.6;
  opacity: 0.8;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: #fff;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-3px);
  opacity: 0.8;
}

.footer-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a,
.footer-links li {
  color: #fff;
  text-decoration: none;
  opacity: 0.8;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-links a:hover,
.footer-links li:hover {
  opacity: 1;
  transform: translateX(5px);
}

.footer-link-icon {
  font-size: 1rem;
}

.footer-bottom {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.7;
  font-size: 0.9rem;
}

/* 背景动画 */
.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 25%),
    radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 15%);
  animation: floatBackground 20s ease-in-out infinite;
  z-index: -1;
}

@keyframes floatBackground {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.5s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 侧边栏切换动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .main-content {
    padding-top: 70px;
  }
  
  .footer-container {
    grid-template-columns: 1fr;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
}
</style>
