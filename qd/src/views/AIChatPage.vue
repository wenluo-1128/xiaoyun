<template>
  <div class="ai-chat-page">
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

    <div class="chat-container">
      <!-- 聊天头部 -->
    <header class="chat-header">
      <div class="chat-info">
        <div class="ai-avatar-small">
          <div class="avatar-circle">
            <Icon icon="carbon:robot" class="avatar-icon" />
          </div>
        </div>
        <div class="chat-title">
          <h2>旅行助手</h2>
          <p class="status-text">
            <span class="status-indicator online"></span> 在线
          </p>
        </div>
      </div>
      <button class="new-chat-btn" @click="startNewChat" aria-label="开始新对话">
         清除对话
      </button>
    </header>

    <!-- 聊天内容区域 -->
    <main class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">
          <Icon icon="carbon:airplane" />
        </div>
        <h3>欢迎使用旅行助手</h3>
        <p>我将帮助您定制专属的旅行方案，让您的旅程更加难忘</p>
      </div>
      
      <div v-for="(msg, index) in messages" :key="index" class="message-wrapper" :class="msg.type === 'ai' ? 'ai-message' : 'user-message'">
        <div class="avatar-container">
          <div class="avatar-circle" :class="msg.type === 'user' ? 'user' : ''">
            <Icon :icon="msg.type === 'ai' ? 'carbon:robot' : 'carbon:user'" class="avatar-icon" />
          </div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <p v-if="!msg.isOptions" :class="msg.type === 'user' ? 'user-text' : ''" v-html="msg.content"></p>
            <template v-else>
              <p>{{ msg.content }}</p>
              <div class="options-container">
                <button 
                  v-for="(option, optIndex) in msg.options" 
                  :key="optIndex"
                  class="option-btn"
                  @click="selectOption(option)"
                  :aria-label="`选择${option}`"
                >
                  <Icon icon="carbon:chevron-right" class="option-icon" />
                  {{ option }}
                </button>
              </div>
            </template>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>
      </div>
      
      <!-- 加载中的提示 -->
      <div v-if="isGeneratingPlan || isAiThinking" class="message-wrapper ai-message">
        <div class="avatar-container">
          <div class="avatar-circle">
            <Icon icon="carbon:robot" class="avatar-icon" />
          </div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p v-if="isGeneratingPlan">正在为您生成专属旅行方案...</p>
            <p v-else>正在思考中...</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部输入区域 -->
    <footer class="chat-input-area">
      <div class="input-container">
        <textarea 
          v-model="message" 
          class="message-input" 
          placeholder="输入消息..."
          rows="1"
          @keydown.enter.ctrl="sendMessage"
          :disabled="isGeneratingPlan"
          aria-label="输入消息"
        ></textarea>
        <button class="send-btn" @click="sendMessage" :disabled="!message.trim() || isGeneratingPlan" aria-label="发送消息">
          <Icon icon="carbon:send" class="send-icon" />
        </button>
      </div>
      <div class="input-hint">
        <span>按 Ctrl + Enter 发送消息</span>
      </div>
    </footer>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useLoginStore } from '../stores/loginStore.js'
import LoginModal from '../components/LoginModal.vue'

// 消息列表
const messages = ref([])
// 输入消息内容
const message = ref('')
// 消息容器引用
const messagesContainer = ref(null)
// 当前问题索引
const currentQuestionIndex = ref(0)
// 是否正在生成方案
const isGeneratingPlan = ref(false)
// AI是否正在思考/回复
const isAiThinking = ref(false)
// 登录状态管理
const router = useRouter()
const loginStore = useLoginStore()
const showLoginModal = ref(false)
// 用户是否手动滚动
const userScrolled = ref(false)
// 滚动阈值（距离底部的像素数）
const scrollThreshold = 100

// 保存消息到localStorage
const saveMessagesToLocalStorage = () => {
  localStorage.setItem('chatMessages', JSON.stringify(messages.value))
  localStorage.setItem('currentQuestionIndex', currentQuestionIndex.value.toString())
}

// 从localStorage加载消息
const loadMessagesFromLocalStorage = () => {
  const savedMessages = localStorage.getItem('chatMessages')
  const savedQuestionIndex = localStorage.getItem('currentQuestionIndex')
  
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  }
  
  if (savedQuestionIndex) {
    currentQuestionIndex.value = parseInt(savedQuestionIndex)
  }
}

// 开始新对话
const startNewChat = () => {
  // 清空消息
  messages.value = []
  // 重置问题索引
  currentQuestionIndex.value = 0
  // 清空localStorage
  localStorage.removeItem('chatMessages')
  localStorage.removeItem('currentQuestionIndex')
  // 发送欢迎消息
  sendWelcomeMessage()
}

const userid1 = ref(0)

const keyword1 = ref('')

// 问题数据
const questions = [
  {
    "content": "你计划在什么季节或时段出行呢？不同时间的旅行体验差异很大哦",
    "options": ["春季", "夏季", "秋季", "冬季", "法定长假"]
  },
  {
    "content": "旅行中，你更想侧重哪种体验？（很多选项自带传统文化彩蛋哦）",
    "options": ["自然景观 + 文化传说", "人文体验为主", "自然与人文平衡"]
  },
  {
    "content": "传统文化包含很多方向，你对哪类更感兴趣？",
    "options": ["民俗节庆", "传统技艺", "古建筑与历史", "传统饮食文化", "传统艺术"]
  },
  {
    "content": "你的旅行节奏是？这会影响文化体验的适配度哦",
    "options": ["慢节奏深度体验", "中等节奏", "多景点串联观光"]
  },
  {
    "content": "你的同行人员是？这会影响文化体验的适配度哦",
    "options": ["独自出行", "情侣/朋友同行", "带家人"]
  },
  {
    "content": "你更倾向哪种传统文化呈现风格？",
    "options": ["偏古朴原生态", "现代融合型", "两者都可"]
  },
  {
    "content": "你能接受的预算大概是多少？",
    "options": ["500以内", "500到2000", "2000以上"]
  },
  {
    "content": "有没有特别想避开或期待的？",
    "options": ["过度拥挤的网红文化景点", "需要高强度体力的文化体验", "穿传统服饰拍照", "参与民俗活动的互动环节", "探访小众传统文化"]
  }
]

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 滚动到底部（智能滚动）
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    // 检查用户是否手动滚动，以及是否在底部附近
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    
    // 只有当用户没有手动滚动，或者距离底部不远时才自动滚动
    if (!userScrolled.value || distanceToBottom <= scrollThreshold) {
      messagesContainer.value.scrollTop = scrollHeight
    }
  }
}

// 监听滚动事件
const handleScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    
    // 如果用户滚动到距离底部超过阈值，标记为手动滚动
    if (distanceToBottom > scrollThreshold) {
      userScrolled.value = true
    } else {
      // 如果用户滚动回到底部附近，重置手动滚动标记
      userScrolled.value = false
    }
  }
}

// 发送欢迎消息
const sendWelcomeMessage = () => {
  messages.value.push({
    type: 'ai',
    content: '你好！我是你的旅行助手。为了给你推荐更合适的个性化旅行方案，我需要先了解一些信息。',
    time: getCurrentTime()
  })
  
  // 保存消息到localStorage
  saveMessagesToLocalStorage()
  
  // 打印发送的消息内容
  // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
  
  nextTick(() => {
    scrollToBottom()
    // 延迟发送第一个问题
    setTimeout(() => {
      sendNextQuestion()
    }, 500)
  })
}

// 发送下一个问题
const sendNextQuestion = () => {
  if (currentQuestionIndex.value < questions.length) {
    const question = questions[currentQuestionIndex.value]
    messages.value.push({
      type: 'ai',
      content: question.content,
      options: question.options,
      isOptions: true,
      time: getCurrentTime()
    })
    
    // 打印发送的消息内容
    // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
    
    currentQuestionIndex.value++
    // 保存消息到localStorage
    saveMessagesToLocalStorage()
    scrollToBottom()
  }
}

// 选择选项回答
const selectOption = (option) => {
  // 添加用户选择的选项
  messages.value.push({
    type: 'user',
    content: option,
    time: getCurrentTime()
  })
  
  // 保存消息到localStorage
  // saveMessagesToLocalStorage()
  
  // 打印发送的消息内容
  // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
  
  // 特殊处理'确定'选项
  if (option === '确定') {
    // 显示提示消息
    setTimeout(async () => {
      messages.value.push({
          type: 'ai',
          content: '正在为你生成专属方案，请前往个人中心查看进度',
          time: getCurrentTime()
        })
        
        // 保存消息到localStorage
        saveMessagesToLocalStorage()
        
        // 打印发送的消息内容
        // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
      
      try {
        // 实现接口调用并获取方案id
        await (async function callNewInterface() {
        try {
          // 定义baseUrl变量
          const baseUrl = import.meta.env.VITE_API_BASE_URL
          // 从本地存储中获取用户ID
          // 获取localStorage中的数据
          const userStr = localStorage.getItem('user');

          // 解析JSON字符串为JavaScript对象
          const userObj = JSON.parse(userStr);

          // 提取id（id在data对象中）
          userid1.value = userObj.data.id;
          console.log(userid1.value);
          
          
          // 获取最后一个AI回复的旅游方案
          let aiPlan = ''
          for (let i = messages.value.length - 1; i >= 0; i--) {
            if (messages.value[i].type === 'ai' && !messages.value[i].isOptions) {
              aiPlan = messages.value[i-3].content.replace(/<[^>]*>/g, '') // 移除HTML标签
              
              const prefix = '基于'
              const prefixIndex = aiPlan.indexOf(prefix)
              console.log(prefixIndex);
              // 如果找到了前缀，从前缀后面开始提取
              if (prefixIndex !== -1) {
                aiPlan=aiPlan.slice(prefixIndex + prefix.length);
              }
              console.log('aiPlan',aiPlan);
              
              break
            }
          }
          
          // 生成加密后的标识符keyword
          // 使用简单的哈希函数模拟加密，实际项目中应使用更安全的加密方法
          function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              hash = ((hash << 5) - hash) + str.charCodeAt(i);
              hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
          }
          
          const dataToHash = `${userid1.value}${aiPlan}`
          let keyword = simpleHash(dataToHash)
          // 如果哈希结果不足50位，补充随机字符
          while (keyword.length < 50) {
            keyword += simpleHash(`${keyword}${Date.now()}`)
          }
          keyword = keyword.substring(0, 50)
          console.log(keyword)
          keyword1.value = keyword
          console.log(keyword1.value)
          
          // 构建message参数（设为可复用的变量），使用JSON.stringify确保正确的JSON格式
          const messageObject = {
            userid: userid1.value,
            query_keyword: keyword,
            ai: aiPlan
          };
          const messageData = JSON.stringify(messageObject)

                  // 使用全局旅行方案信息
          //     // 发送POST请求
        const response = await fetch('/api/user-info/insert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userid: userid1.value,
            query_keyword: keyword1.value,
            theme: travelPlanInfo.value.title || '',
            depart_time: travelPlanInfo.value.dates || '',
            destination: travelPlanInfo.value.destination || '',
            the_count: travelPlanInfo.value.peopleCount || '',
            budget: travelPlanInfo.value.budget || ''
          })
        })
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    const data = await response.json()
    console.log('响应数据:', data)

          
          // 三个接口并行调用
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_2
          const API_ENDPOINTS = {
            CREATE_FORM: '/api/ing-forms/create'
          };
          
          // 第一个接口的调用函数
          const callFirstInterface = async () => {
            try {
              // 1. 获取会话ID
              const sessionResponse = await fetch(`${baseUrl}/chat/api/open`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_API_KEY_1}`,
                  'Content-Type': 'application/json'
                }
              })
              
              const sessionData = await sessionResponse.json()
              if (sessionData.code !== 200) {
                throw new Error(`获取会话ID失败: ${sessionData.message}`)
              }
              
              const chatId = sessionData.data
              
              // 2. 调用chat_message接口
              await fetch(`${baseUrl}/chat/api/chat_message/${chatId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_API_KEY_1}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: messageData,
                  stream: false,
                  re_chat: false
                })
              })
              
              console.log('第一个接口调用成功')
            } catch (error) {
              console.error('第一个接口调用失败:', error)
            }
          }
          
          // 第二个接口的调用函数
          const callSecondInterface = async () => {
            try {
              // 1. 获取会话ID
              const sessionResponse = await fetch(`${baseUrl}/chat/api/open`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_API_KEY_2}`,
                  'Content-Type': 'application/json'
                }
              })
              
              const sessionData = await sessionResponse.json()
              if (sessionData.code !== 200) {
                throw new Error(`获取第二个会话ID失败: ${sessionData.message}`)
              }
              
              const chatId = sessionData.data
              
              // 2. 调用chat_message接口
              const chatResponse = await fetch(`${baseUrl}/chat/api/chat_message/${chatId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_API_KEY_2}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: messageData,
                  stream: false,
                  re_chat: false
                })
              })
              
              if (!chatResponse.ok) {
                throw new Error(`第二个接口HTTP error! status: ${chatResponse.status}`)
              }
              
              console.log('第二个接口调用成功')
            } catch (error) {
              console.error('第二个接口调用失败:', error)
            }
          }
          
          // 第三个接口的调用函数
          const callThirdInterface = async () => {
            try {
              const formData = {
                user_id: userid1.value,
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
              // 更新currentPlanId全局状态
      currentPlanId.value = responseData.data.id;
      console.log('获取成功h',currentPlanId.value);
      
      // 如果成功获取到方案id，更新localStorage中的旅行方案数组
      if (currentPlanId.value) {
        try {
          // 获取方案数组
          const existingPlans = JSON.parse(localStorage.getItem('travelPlans') || '[]');
          // 查找并更新第一个方案（通常是当前正在创建的方案）
          if (existingPlans.length > 0) {
            existingPlans[0].id = currentPlanId.value;
            // 保存更新后的数组
            localStorage.setItem('travelPlans', JSON.stringify(existingPlans));
            console.log('已更新方案数组中第一个方案的id:', currentPlanId.value);
          }
        } catch (error) {
          console.error('更新localStorage失败:', error);
        }
      }
              return responseData.data?.id || null; // 返回方案id
            } catch (error) {
              console.error('第三个接口调用失败:', error);
              return null; // 出错时返回null
            }
          }
          
          // 使用Promise.all并行调用三个接口，并获取第三个接口的返回值
          const [, , planId] = await Promise.all([
            callFirstInterface(),
            callSecondInterface(),
            callThirdInterface()
          ])
          
          return planId; // 返回方案id
        } catch (error) {
          console.error('接口调用失败:', error);
          return null;
        }
      })();
      
      
    } catch (error) {
      console.error('处理方案确认失败:', error);
    }
      
      scrollToBottom()
      
      // 模拟接口调用成功后，显示成功提示
      setTimeout(() => {
        messages.value.push({
            type: 'ai',
            content: '已为你生成专属方案，请前往个人中心查看',
            time: getCurrentTime()
          })
          
          // 保存消息到localStorage
          saveMessagesToLocalStorage()
          
          // 打印发送的消息内容
          // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
        scrollToBottom()
      }, 2000) // 模拟2秒后接口调用完成
    }, 500)
    return
  }
  
  // 如果还有问题，先显示加载状态，2秒后再发送下一个问题
  if (currentQuestionIndex.value < questions.length) {
    isAiThinking.value = true
    setTimeout(() => {
      isAiThinking.value = false
      sendNextQuestion()
    }, 500)
  } else {
    // 所有问题回答完毕，开始生成方案
    isAiThinking.value = true
    setTimeout(() => {
      isAiThinking.value = false
      generateTravelPlan()
    }, 2000)
  }
  
  scrollToBottom()
}

// 发送消息函数
const sendMessage = () => {
  if (message.value.trim() && !isGeneratingPlan.value) {
    // 添加用户消息
    messages.value.push({
      type: 'user',
      content: message.value.trim(),
      time: getCurrentTime()
    })
    // 打印发送的消息内容
    // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
    
    const userMessage = message.value.trim()
    message.value = ''
      
      // 如果还有问题，先显示加载状态，2秒后再发送下一个问题
      if (currentQuestionIndex.value < questions.length) {
        isAiThinking.value = true
        setTimeout(() => {
          isAiThinking.value = false
          sendNextQuestion()
        }, 2000)
      } else {
        // 所有问题回答完毕，开始生成方案
        isAiThinking.value = true
        setTimeout(() => {
          isAiThinking.value = false
          generateTravelPlan()
        }, 2000)
      }
    
    scrollToBottom()
  }
}

// 当前方案id
const currentPlanId = ref(null);

// 全局旅行方案信息
const travelPlanInfo = ref({
  id: null,
  title: '',
  destination: '',
  dates: '',
  peopleCount: '',
  budget: '',
  status: '',
  preferences: {
    season: '',
    experienceType: '',
    cultureFocus: '',
    travelPace: '',
    travelers: '',
    cultureStyle: '',
    budgetRange: '',
    specialPreferences: ''
  }
});

// 生成旅行方案
  const generateTravelPlan = async () => {
    isGeneratingPlan.value = true
    
    // 收集所有聊天记录
    const chatHistory = messages.value.map(msg => ({
      role: msg.type === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }))
    
    // 收集用户回答的信息 - 修正逻辑：直接从消息列表中提取用户回答
    const collectedInfo = []
    let userAnswerCount = 0
    
    for (const msg of messages.value) {
      // 只收集用户消息，且是选择的答案（不是用户主动输入的其他消息）
      if (msg.type === 'user' && userAnswerCount < questions.length) {
        collectedInfo.push(msg.content)
        userAnswerCount++
      }
    }
    
    // 如果收集的答案不足，用默认值填充
    while (collectedInfo.length < questions.length) {
      collectedInfo.push('未指定')
    }
    
    const info = `用户旅行偏好信息：
1. 季节/时段：${collectedInfo[0]}
2. 体验类型：${collectedInfo[1]}
3. 文化重点：${collectedInfo[2]}
4. 旅行节奏：${collectedInfo[3]}
5. 出行人员：${collectedInfo[4]}
6. 文化风格：${collectedInfo[5]}
7. 预算范围：${collectedInfo[6]}
8. 特殊偏好：${collectedInfo[7]}`
    
    // 存储收集到的信息到全局变量和localStorage，供ProfilePage使用
    travelPlanInfo.value = {
      id: currentPlanId.value, // 添加方案id
      title: `${collectedInfo[0]} ${collectedInfo[1]}之旅`,
      destination: collectedInfo[2],
      dates: collectedInfo[0],
      peopleCount: collectedInfo[4],
      budget: collectedInfo[6],
      status: '进行中',
      preferences: {
        season: collectedInfo[0],
        experienceType: collectedInfo[1],
        cultureFocus: collectedInfo[2],
        travelPace: collectedInfo[3],
        travelers: collectedInfo[4],
        cultureStyle: collectedInfo[5],
        budgetRange: collectedInfo[6],
        specialPreferences: collectedInfo[7]
      }
    };


    
    // 获取现有方案数组，如果不存在则创建空数组
    const existingPlans = JSON.parse(localStorage.getItem('travelPlans') || '[]');
    // 添加新方案到数组开头
    existingPlans.unshift(travelPlanInfo);
    // 保存更新后的数组
    localStorage.setItem('travelPlans', JSON.stringify(existingPlans));
    console.log('旅行方案信息已存储到数组中，包含方案id:', travelPlanInfo.id);
  
  try {
    // 1. 调用获取会话ID的接口
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      const apiKey = import.meta.env.VITE_API_KEY_3
    
    const sessionResponse = await fetch(`${baseUrl}/chat/api/open`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const sessionData = await sessionResponse.json()
    
    if (sessionData.code !== 200) {
      throw new Error(`获取会话ID失败: ${sessionData.message}`)
    }
    
    const chatId = sessionData.data
    
    
    // 处理流式响应
    const chatResponse = await fetch(`${baseUrl}/chat/api/chat_message/${chatId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        info: info,
        message: info,
        stream: true,
        re_chat: false
      })
    })
    
    if (!chatResponse.ok) {
      throw new Error(`HTTP error! status: ${chatResponse.status}`)
    }
    
    // 添加一个空的AI响应消息，用于实时更新
    let streamingMessageIndex = messages.value.length
    messages.value.push({
      type: 'ai',
      content: '',
      time: getCurrentTime()
    })
    
    // 保存消息到localStorage
    // saveMessagesToLocalStorage()
    
    // 打印发送的消息内容
    // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
    
    // 处理流式响应
    const reader = chatResponse.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let collectedContent = ''
    let isStreamComplete = false
    let buffer = ''
    let parseCount = 0
    
    while (!isStreamComplete) {
      const { done, value } = await reader.read()
      if (done) {
        isStreamComplete = true
        break
      }
      
      // 解码接收到的数据块
      const chunk = decoder.decode(value, { stream: true })
      
      // 将新数据添加到缓冲区
      buffer += chunk
      
      // 分割多个data块
      const dataChunks = buffer.split('data: ')
      
      // 保留最后一个可能不完整的块
      buffer = dataChunks.pop() || ''
      
      for (const dataChunk of dataChunks) {
        try {
          // 校验数据块是否有效
          if (!dataChunk || dataChunk.trim() === '') {
            continue
          }
          
          // 尝试解析JSON，处理可能的多行或格式问题
          let parsedData
          try {
            parsedData = JSON.parse(dataChunk.trim())
          } catch (parseError) {
            // 尝试修复常见的JSON格式问题
            const trimmed = dataChunk.trim()
            // 检查是否是数组格式
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              try {
                parsedData = JSON.parse(trimmed)
              } catch {
                throw parseError
              }
            } else {
              throw parseError
            }
          }
          
          // 检查是否有有用的content
          if (parsedData.content && parsedData.content.trim()) {
            // 逐字添加内容，实现打字机效果
            const newContent = parsedData.content
            for (let i = 0; i < newContent.length; i++) {
              collectedContent += newContent[i]
              parseCount++
              
              // 实时更新消息内容，移除quick_question标签
              let currentContent = collectedContent
                .replace(/<quick_question>/g, '')
                .replace(/<\/quick_question>/g, '')
                .trim()
              
              // 每50次解析时，重新解析整个内容
              if (parseCount % 50 === 0) {
                currentContent = collectedContent
                  .replace(/<quick_question>/g, '')
                  .replace(/<\/quick_question>/g, '')
                  .trim()
              }
              
              // 实时更新消息
              messages.value[streamingMessageIndex].content = formatMarkdownForVue(currentContent)
              
              // 滚动到底部以显示最新内容
              await nextTick()
              scrollToBottom()
              
              // 添加小延迟，实现打字机效果
              await new Promise(resolve => setTimeout(resolve, 10))
            }
          }
          
          // 检查是否是最后一个数据块
          if (parsedData.is_end) {
            isStreamComplete = true
          }
        } catch (e) {
          // 更详细的错误日志，帮助调试
          const errorInfo = {
            error: e.message,
            dataChunkPreview: dataChunk.substring(0, 100),
            dataChunkLength: dataChunk.length,
            bufferLength: buffer.length
          }
          console.error('解析数据块失败:', errorInfo)
          
          // 如果是JSON解析错误，可能是数据块被截断，继续处理下一个块
          if (e instanceof SyntaxError) {
            // 尝试从错误中恢复：检查是否是不完整的JSON
            const trimmed = dataChunk.trim()
            if (trimmed.length > 0 && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
              // 可能是普通文本内容，直接添加到collectedContent
              console.log('检测到非JSON数据，作为普通内容处理')
              // 逐字添加内容，实现打字机效果
              for (let i = 0; i < trimmed.length; i++) {
                collectedContent += trimmed[i]
                parseCount++
                
                // 实时更新消息内容
                let currentContent = collectedContent
                  .replace(/<quick_question>/g, '')
                  .replace(/<\/quick_question>/g, '')
                  .trim()
                
                // 每50次解析时，重新解析整个内容
                if (parseCount % 50 === 0) {
                  currentContent = collectedContent
                    .replace(/<quick_question>/g, '')
                    .replace(/<\/quick_question>/g, '')
                    .trim()
                }
                
                messages.value[streamingMessageIndex].content = formatMarkdownForVue(currentContent)
                
                // 滚动到底部以显示最新内容
                await nextTick()
                scrollToBottom()
                
                // 添加小延迟，实现打字机效果
                await new Promise(resolve => setTimeout(resolve, 10))
              }
            }
          }
        }
      }
    }
    
    // 最终处理收集到的内容
    let planContent = collectedContent
      .replace(/<quick_question>/g, '')
      .replace(/<\/quick_question>/g, '')
      .trim()
      console.log(planContent)
    // 处理markdown格式，确保正确显示
    planContent = formatMarkdownForVue(planContent)
    
    // 如果没有收集到有效内容，使用默认方案
    if (!planContent) {
      planContent = `
        <h3>根据您的需求，为您生成的传统文化旅行方案：</h3>
        <p>基于您提供的信息，我们为您定制了一份专属传统文化旅行体验。</p>
        
        <h4>方案概览</h4>
        <ul>
          <li><strong>主题：</strong>深度传统文化探索之旅</li>
          <li><strong>适合季节：</strong>${collectedInfo[0]}</li>
          <li><strong>体验类型：</strong>${collectedInfo[1]}</li>
          <li><strong>文化重点：</strong>${collectedInfo[2]}</li>
          <li><strong>旅行节奏：</strong>${collectedInfo[3]}</li>
          <li><strong>出行人员：</strong>${collectedInfo[4]}</li>
          <li><strong>文化风格：</strong>${collectedInfo[5]}</li>
          <li><strong>预算范围：</strong>${collectedInfo[6]}</li>
        </ul>
        
        <h4>推荐行程</h4>
        <p>Day 1: 抵达目的地，入住特色文化主题酒店</p>
        <p>Day 2: 参观当地历史文化遗迹，了解传统文化背景</p>
        <p>Day 3: 参与传统工艺体验，亲手制作文化纪念品</p>
        <p>Day 4: 品尝正宗传统美食，了解饮食文化</p>
        <p>Day 5: 自由活动，深度探索小众文化景点</p>
        
        <p>希望这份旅行方案能满足您的需求！如果您需要进一步调整或有任何问题，请随时告诉我。</p>
      `
    }
    
    // 更新最终内容
    messages.value[streamingMessageIndex].content = planContent
    
    // 打印最终的消息内容
    // console.log('最终的消息内容:', messages.value[streamingMessageIndex].content)
    
    // 方案生成完成后，添加询问满意度的消息并提供确定选项
    setTimeout(() => {
      messages.value.push({
        type: 'ai',
        content: '你对这个方案满意吗，满意的话请回复确定',
        options: ['确定'],
        isOptions: true,
        time: getCurrentTime()
      })
      
      // 保存消息到localStorage
      saveMessagesToLocalStorage()
      
      // 打印发送的消息内容
      // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
      scrollToBottom()
    }, 500)
    
  } catch (error) {
    console.error('API调用失败:', error)
    
    // 错误处理：显示友好的错误消息
    messages.value.push({
      type: 'ai',
      content: `<p>很抱歉，生成旅行方案时遇到了问题。请稍后再试，或者您可以尝试重新开始对话。</p><p class="error-detail">错误信息：${error.message}</p>`,
      time: getCurrentTime()
    })
    
    // 保存消息到localStorage
    saveMessagesToLocalStorage()
    
    // 打印发送的消息内容
    // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
  } finally {
    isGeneratingPlan.value = false
    scrollToBottom()
  }
}

// 格式化Markdown为Vue可渲染的HTML
const formatMarkdownForVue = (markdown) => {
  // 处理标题
  let html = markdown
  .replace(/#### ?(.*$)/gm, '<h4 class="markdown-h4">$1</h4><br>')
  .replace(/### ?(.*$)/gm, '<h4 class="markdown-h4">$1</h4><br>')
  .replace(/## ?(.*$)/gm, '<h3 class="markdown-h3">$1</h3><br>')
  .replace(/(\d+\.) \*\*(.*?)\*\*：(.*)/gm, '<li><strong>$2</strong>：$3</li>')
    
    
    
  // 处理加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<br><strong>$1</strong>')
  
  // 处理分隔线
  html = html.replace(/^---$/gm, '<br><hr class="markdown-hr"><br>')
  
  // 处理代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  // 处理引用
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  
  // 处理列表
  // 首先将所有列表项转换为<li>标签
  html = html.replace(/^(\s*)[\-\*] (.*)$/gm, '$1<li style="list-style-type: none;">$2</li>')
  
  // 然后将连续的<li>标签包装在<ul>标签中
  // 处理嵌套列表
  let result = ''
  const lines = html.split('\n')
  let inList = false
  let currentIndent = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const indentMatch = line.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1].length : 0
    const trimmedLine = line.trim()
    
    if (trimmedLine === '') {
      // 空行，结束当前段落和列表
      if (inList) {
        result += '</ul><br>\n'
        inList = false
      }
      result += '\n'
      continue
    }
    
    if (trimmedLine.startsWith('<li style="list-style-type: none;">')) {
      // 列表项
      if (!inList) {
        // 开始新列表
        result += '<ul class="markdown-list" style="list-style-type: none;">\n'
        inList = true
        currentIndent = indent
      } else if (indent > currentIndent) {
        // 嵌套列表
        result += '<ul class="markdown-list" style="list-style-type: none;">\n'
        currentIndent = indent
      } else if (indent < currentIndent) {
        // 结束当前列表，开始新列表
        while (currentIndent > indent) {
          result += '</ul><br>\n'
          currentIndent -= 2 // 假设缩进为2个空格
        }
      }
      result += line + '\n'
    } else {
      // 非列表项
      if (inList) {
        // 结束当前列表
        while (currentIndent > 0) {
          result += '</ul><br>\n'
          currentIndent -= 2
        }
        inList = false
      }
      
      // 处理普通文本
      if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<pre') || trimmedLine.startsWith('<blockquote') || trimmedLine.startsWith('<hr')) {
        // HTML元素，直接添加
        result += line + '\n'
      } else {
        // 普通段落
        result += `<p>${trimmedLine}</p>\n`
      }
    }
  }
  
  // 关闭所有未关闭的列表
  while (inList) {
    result += '</ul><br>\n'
    currentIndent -= 2
    if (currentIndent <= 0) {
      inList = false
    }
  }
  
  return result
}


// 组件挂载时初始化登录状态并检查
onMounted(() => {
  // 初始化登录状态
  loginStore.initializeAuth()
  
  // 从localStorage加载消息
  loadMessagesFromLocalStorage()
  
  // 添加滚动事件监听器
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
  }
  
  // 检查是否已登录
  if (loginStore.isAuthenticated()) {
    // 如果没有消息，发送欢迎消息
    if (messages.value.length === 0) {
      sendWelcomeMessage()
    } else {
      // 如果有消息，滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    }
  } else {
    // 未登录时显示登录弹窗
    showLoginModal.value = true
  }
})

// 处理登录成功
const handleLoginSuccess = () => {
  // 如果没有消息，发送欢迎消息
  if (messages.value.length === 0) {
    sendWelcomeMessage()
  }
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
.ai-chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  max-width: 1280px;
  margin: auto;

  /* background-color: var(--bg-gray-lighter); */
  overflow: hidden;
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


/* 聊天头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--white);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-light);

}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-large);
  background-color: var(--white);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition-fast);
}

.new-chat-btn:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.new-chat-icon {
  font-size: 1rem;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ai-avatar-small .avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: var(--transition-fast);
}

.status-indicator.online {
  background-color: var(--success-color);
  box-shadow: 0 0 10px var(--success-color);
  animation: pulse 2s ease-in-out infinite;
}


.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-gray-lighter);
  z-index: 1;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* 聊天内容区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  gap: 1.5rem;
  animation: fadeIn 1s ease-out;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 2rem;
  box-shadow: var(--shadow-medium);
  animation: float 3s ease-in-out infinite;
}

.welcome-message h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.welcome-message p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0;
  line-height: 1.6;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 80%;
}

.ai-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-container {
  display: flex;
  align-items: flex-start;
}

.avatar-container .avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-circle.user {
  background: var(--gradient-primary);
}

.avatar-icon {
  font-size: 1.5rem;
  color: var(--white);
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

ul {
  padding-left: 20px;
  list-style-type: none;
}

li {
  list-style-type: none;
}

.message-bubble {
  padding: 1rem 2rem;
  border-radius: 18px;
  word-wrap: break-word;
}

.ai-message .message-bubble {
  background-color: var(--white);
  border-bottom-left-radius: 6px;
  box-shadow: var(--shadow-light);
}

.user-message .message-bubble {
  background: var(--gradient-primary);
  color: var(--white);
  border-bottom-right-radius: 6px;
  box-shadow: var(--shadow-light);
}

.user-message .message-bubble p {
  color: var(--white) !important;
  z-index: 1;
  position: relative;
}

.user-text {
  color: var(--white) !important;
  z-index: 1;
  position: relative;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-lighter);
  margin-top: 0.5rem;
  align-self: flex-end;
}

.ai-message .message-time {
  align-self: flex-start;
}

/* 选项样式 */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.option-btn {
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-large);
  background: var(--white-transparent-95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.95rem;
  transition: var(--transition-fast);
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--white-transparent-18);
}

.option-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--white);
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.option-icon {
  font-size: 0.8rem;
  transition: var(--transition-fast);
}

.option-btn:hover .option-icon {
  transform: translateX(5px);
}

/* 加载动画 */
.loading-dots {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 生成的方案样式 */
.message-bubble h3, .message-bubble h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--text-primary);
}

.message-bubble h3 {
  font-size: 1.1rem;
}

.message-bubble h4 {
  font-size: 1rem;
  color: var(--text-tertiary);
}

.message-bubble ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-bubble li {
  margin: 0.25rem 0;
}

.message-bubble strong {
  color: var(--color-primary);
}

/* Markdown样式 */
.markdown-h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary);
}

.markdown-h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin: 1.2rem 0 0.8rem 0;
}

.markdown-h5 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin: 1rem 0 0.6rem 0;
}

.message-bubble ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

/* 表格样式 */
.markdown-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-light);
  border-radius: var(--radius-medium);
  overflow: hidden;
}

.markdown-table td {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  text-align: left;
}

.markdown-table tr:nth-child(even) {
  background-color: var(--bg-gray-lighter);
}

.markdown-table tr:hover {
  background-color: var(--bg-gray-light);
  transition: background-color var(--transition-fast);
}

.message-bubble li {
  margin: 0.5rem 0;
  line-height: 1.5;
  position: relative;
}

.message-bubble blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-tertiary);
  font-style: italic;
}

.message-bubble pre {
  background-color: var(--bg-gray-lighter);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.message-bubble code {
  font-family: 'Courier New', monospace;
  background-color: var(--bg-gray-lighter);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 2rem 0;
}

/* 底部输入区域 */
.chat-input-area {
  background-color: var(--white);
  border-top: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.input-container {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 1rem;
  resize: none;
  outline: none;
  font-family: inherit;
}
.message-input::-webkit-scrollbar {
  display: none;
}

.message-input::-webkit-scrollbar-track {
  background: var(--white-transparent-10);
  border-radius: 4px;
}

.message-input::-webkit-scrollbar-thumb {
  background: var(--gradient-primary);
  border-radius: 4px;
  transition: var(--transition-fast);
}

.message-input::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #85C1E9 0%, var(--color-primary) 100%);
  transform: scaleX(1.1);
}

.message-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.message-input:disabled {
  background-color: var(--bg-gray-lighter);
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  /* background: #ccc; */
  cursor: not-allowed;
}

.send-icon {
  font-size: 1rem;
}

.input-hint {
  margin-top: 0.5rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.input-hint span {
  font-size: 0.75rem;
  color: var(--text-lighter);
}

.question-progress {
  color: var(--color-primary) !important;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-chat-page {
    width: 100%;
    height: calc(100vh - 40px);
  }
  
  .chat-header {
    padding: 1rem;
  }
  
  .chat-messages {
    padding: 1rem;
    gap: 1rem;
  }
  
  .message-wrapper {
    max-width: 90%;
  }
  
  .chat-input-area {
    padding: 1rem;
  }
  
  .options-container {
    flex-direction: column;
  }
  
  .option-btn {
    width: 100%;
  }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--white-transparent-10);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--gradient-primary);
  border-radius: 4px;
  transition: var(--transition-fast);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #85C1E9 0%, var(--color-primary) 100%);
  transform: scaleX(1.1);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 消息动画 */
.message-wrapper {
  animation: fadeIn 0.5s ease-out;
}

.message-input {
  transition: var(--transition-fast);
}

.message-input:focus {
  transform: translateY(-1px);
}

.send-btn {
  transition: var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.send-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--transition-fast);
}

.send-btn:hover::before {
  left: 100%;
}

.send-icon {
  transition: var(--transition-fast);
  z-index: 1;
  position: relative;
}

.send-btn:hover .send-icon {
  transform: scale(1.1) rotate(45deg);
}

/* 问题进度改进 */
.question-progress {
  background: var(--primary-transparent-20);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  animation: pulse 2s ease-in-out infinite;
}
</style>