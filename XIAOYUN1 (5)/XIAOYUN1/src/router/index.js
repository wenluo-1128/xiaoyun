import { createRouter, createWebHistory } from 'vue-router'
import AIChatPage from '../views/AIChatPage.vue'
import FormCollectionPage from '../views/FormCollectionPage.vue'
import AboutPage from '../views/AboutPage.vue'
import ProfilePage from '../views/ProfilePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/about'
  },
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: AIChatPage,
    meta: {
      title: 'AI对话 - 旅游方案定制'
    }
  },
  {
    path: '/form',
    name: 'Form',
    component: FormCollectionPage,
    meta: {
      title: '定制表单 - 旅游方案定制'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
    meta: {
      title: '关于我们 - 旅游方案定制'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: {
      title: '个人中心 - 旅游方案定制'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫，设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router