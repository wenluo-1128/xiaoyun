import { createRouter, createWebHistory } from 'vue-router'
import AIChatPage from '../views/AIChatPage.vue'
import FormCollectionPage from '../views/FormCollectionPage.vue'
import AboutPage from '../views/AboutPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import RoutePlanner from '../views/RoutePlanner.vue'
import TravelPlanView from '../views/TravelPlanView.vue'

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
      title: '智能咨询 - 云途绘迹'
    }
  },
  {
    path: '/form',
    name: 'Form',
    component: FormCollectionPage,
    meta: {
      title: '计划定制 - 云途绘迹'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
    meta: {
      title: '云途绘迹 - 云途绘迹'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: {
      title: '个人中心 - 云途绘迹'
    }
  },
  {
    path: '/route-planner',
    name: 'RoutePlanner',
    component: RoutePlanner,
    meta: {
      title: '路线展示 - 云途绘迹'
    }
  },
  {
    path: '/travel-plan-view',
    name: 'TravelPlanView',
    component: TravelPlanView,
    meta: {
      title: '计划详情 - 云途绘迹'
    }
  },
  {
    path: '/travel-plan-view/:userid/:codeid',
    name: 'TravelPlanViewWithParams',
    component: TravelPlanView,
    props: true,
    meta: {
      title: '计划详情 - 云途绘迹'
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