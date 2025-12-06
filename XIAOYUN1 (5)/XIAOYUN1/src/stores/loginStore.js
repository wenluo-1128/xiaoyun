import { reactive } from 'vue'

// 创建一个响应式的登录状态对象
const loginState = reactive({
  isLoggedIn: false,
  username: null,
  token: null
})

// 登录函数
export function useLoginStore() {
  // 初始化时检查本地存储中的登录状态
  const initializeAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        loginState.isLoggedIn = true
        loginState.username = userData.username
        loginState.token = userData.token
      } catch (e) {
        console.error('解析用户数据失败:', e)
        logout()
      }
    }
  }
  
  // 登录函数
  const login = (userData) => {
    // 使用id作为token
    const token = String(userData.id)
    
    loginState.isLoggedIn = true
    loginState.username = userData.name || userData.phone
    loginState.token = token
    
    // 保存完整用户信息到本地存储
    localStorage.setItem('user', JSON.stringify({
      username: loginState.username,
      token: token,
      // 存储完整用户信息
      ...userData
    }))
  }
  
  // 登出函数
  const logout = () => {
    loginState.isLoggedIn = false
    loginState.username = null
    loginState.token = null
    
    // 清除本地存储
    localStorage.removeItem('user')
  }
  
  // 获取登录状态
  const isAuthenticated = () => {
    return loginState.isLoggedIn
  }
  
  // 获取用户名
  const getUsername = () => {
    return loginState.username
  }
  
  return {
    ...loginState,
    initializeAuth,
    login,
    logout,
    isAuthenticated,
    getUsername
  }
}