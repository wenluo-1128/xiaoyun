<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar navbar-scrolled">
      <div class="navbar-container">
        <router-link to="/" class="logo" aria-label="云途绘迹首页">
          <img src="/logo.png" class="logo-icon" alt="云途绘迹" />
          <span class="logo-text">云途绘迹</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/about" class="nav-link" active-class="active">首页</router-link>
          <router-link to="/ai-chat" class="nav-link" active-class="active">AI对话</router-link>
          <router-link to="/form" class="nav-link" active-class="active">定制表单</router-link>
          <router-link to="/profile" class="nav-link" active-class="active">个人中心</router-link>
        </div>
        
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="切换菜单">
          <Icon :icon="mobileMenuOpen ? 'carbon:close' : 'carbon:menu'" class="menu-icon" />
        </button>
      </div>
      
      <!-- 移动端菜单 -->
      <transition name="slide">
        <div v-show="mobileMenuOpen" class="mobile-menu" role="navigation">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path" 
            class="mobile-nav-link" 
            @click="mobileMenuOpen = false"
          >
            {{ item.label }}
          </router-link>
        </div>
      </transition>
    </nav>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }" class="content-wrapper">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { path: '/about', label: '首页' },
  { path: '/ai-chat', label: 'AI对话' },
  { path: '/form', label: '定制表单' },
  { path: '/profile', label: '个人中心' }
]
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
  background: linear-gradient(135deg, #F8FAFD 0%, #E3F2FD 100%);
  min-height: 100vh;
  color: var(--text-primary);
  overflow-x: hidden;
}

/* 应用容器 */
.app {
  position: relative;
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  /* display: none; */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--white-transparent-95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--white-transparent-18);
  box-shadow: var(--shadow-light);
  transition: var(--transition-fast);
  padding: 0.5rem 0;
}

/* 滚动时的导航栏效果 */
.navbar-scrolled {
  background: var(--white-transparent-10);
  box-shadow: var(--shadow-medium);
  padding: 0.25rem 0;
}

.navbar-scrolled .logo,
.navbar-scrolled .nav-link,
.navbar-scrolled .mobile-menu-btn {
  color: var(--color-primary);
}

.navbar-scrolled .nav-link.active::after {
  background: var(--color-primary);
  opacity: 0;
}

.navbar-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition-fast);
}

.logo {
  display: flex;
  /* align-items: center; */
  /* gap: 0.5rem; */
  text-decoration: none;
  color: var(--white);
  font-weight: bold;
  font-size: 2rem;
  transition: var(--transition-fast);
  cursor: pointer;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  /* width: 77px; */
  height: 50px;
  transition: var(--transition-fast);
}

.nav-links {
  display: flex;
  gap: 3rem;
  font-size: 1.1rem;
}

.nav-link {
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  position: relative;
  transition: var(--transition-fast);
  border-radius: var(--radius-medium);
  cursor: pointer;
}

.nav-link:hover {
  color: var(--primary-transparent-30);
  background: var(--white-transparent-10);
  transform: translateY(-2px);
}

.nav-link.active {
  color: var(--white);
  background: var(--primary-transparent-30);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: var(--white-transparent-80);
  border-radius: 3px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--white);
  cursor: pointer;
  font-size: 1.5rem;
  transition: var(--transition-fast);
  padding: 0.5rem;
  border-radius: var(--radius-medium);
}

.mobile-menu-btn:hover {
  background: var(--white-transparent-10);
}

/* 移动端菜单 */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--primary-transparent-95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-medium);
  border-bottom-left-radius: var(--radius-large);
  border-bottom-right-radius: var(--radius-large);
  overflow: hidden;
}

.mobile-nav-link {
  display: block;
  color: var(--white);
  text-decoration: none;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--white-transparent-10);
  transition: var(--transition-fast);
  cursor: pointer;
}

.mobile-nav-link:hover {
  background: var(--white-transparent-10);
  transform: translateX(10px);
}

.mobile-nav-link.active {
  background: var(--primary-transparent-30);
  font-weight: 600;
}

/* 主内容区域 */
.main-content {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.1) 100%);
  padding-top: 80px;
  height: 100vh; /* 占满视口高度 */
  overflow: hidden; /* 外层容器不滚动，防止整体滚动带动背景 */
  position: relative; /* 为内容区域的绝对定位做铺垫 */
}

.content-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  height: 100vh;
  overflow-y: auto; /* 仅垂直方向滚动，水平方向不滚动（更符合常规需求） */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }
  
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .main-content {
    padding-top: 70px;
  }
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: var(--transition-medium);
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
  transition: var(--transition-fast);
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
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(200, 200, 200, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(200, 200, 200, 0.5);
}
</style>
