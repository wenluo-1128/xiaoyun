import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'animate.css'
import './style.css'
import { useLoginStore } from './stores/loginStore.js'

const app = createApp(App)

// 使用路由
app.use(router)

// 全局初始化登录状态
const loginStore = useLoginStore()
loginStore.initializeAuth()

// 挂载应用
app.mount('#app')
