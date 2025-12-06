<template>
  <div class="ai-chat-page">
    <!-- 登录弹窗 -->
    <LoginModal 
      :visible="showLoginModal" 
      @close="handleCloseLoginModal"
      @login-success="handleLoginSuccess"
    />
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
          <p class="status-text">在线</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="header-btn" aria-label="清空聊天" @click="clearChat">
          <Icon icon="carbon:trash-can" class="header-icon" />
        </button>
        <button class="header-btn" aria-label="更多选项">
          <Icon icon="carbon:ellipsis-vertical" class="header-icon" />
        </button>
      </div>
    </header>

    <!-- 聊天内容区域 -->
    <main class="chat-messages" ref="messagesContainer">
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
                >
                  {{ option }}
                </button>
              </div>
            </template>
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
        ></textarea>
        <button class="send-btn" @click="sendMessage" :disabled="!message.trim() || isGeneratingPlan">
          <Icon icon="carbon:send" class="send-icon" />
        </button>
      </div>
      <div class="input-hint">
        <span>按 Ctrl + Enter 发送消息</span>
        <span v-if="currentQuestionIndex > 0 && currentQuestionIndex < questions.length" class="question-progress">
          （{{ currentQuestionIndex }}/{{ questions.length }}）
        </span>
      </div>
    </footer>
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

// 问题数据
const questions = [
  {
    "content": "你计划在什么季节或时段出行呢？不同时间的传统文化体验差异很大哦",
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

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 发送欢迎消息
const sendWelcomeMessage = () => {
  messages.value.push({
    type: 'ai',
    content: '你好！我是你的旅行助手。为了给你推荐更合适的传统文化旅行方案，我需要先了解一些信息。',
    time: getCurrentTime()
  })
  
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
        
        // 打印发送的消息内容
        // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
      
      try {
        // 实现接口调用并获取方案id
        await (async function callNewInterface() {
        try {
          // 定义baseUrl变量
          const baseUrl = 'http://172.30.32.1:8080'
          // 从本地存储中获取用户ID
          // 获取localStorage中的数据
          const userStr = localStorage.getItem('user');

          // 解析JSON字符串为JavaScript对象
          const userObj = JSON.parse(userStr);
  
          // 提取id（id在data对象中）
          const userid = userObj.data.id;
          
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
          
          const dataToHash = `${userid}${aiPlan}`
          let keyword = simpleHash(dataToHash)
          // 如果哈希结果不足50位，补充随机字符
          while (keyword.length < 50) {
            keyword += simpleHash(`${keyword}${Date.now()}`)
          }
          keyword = keyword.substring(0, 50)
          
          // 构建message参数（设为可复用的变量），使用JSON.stringify确保正确的JSON格式
          const messageObject = {
            userid: userid,
            query_keyword: keyword,
            ai: aiPlan
          };
          const messageData = JSON.stringify(messageObject)
          
          // 三个接口并行调用
          const newApiKey = 'application-a242f7ed373e9c173fd6b0c5c215846d'
          const secondApiKey = 'application-307c1435d45c0b294efed46a9956d4db'
          const API_BASE_URL = 'http://172.30.32.1:3005';
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
                  'Authorization': `Bearer ${newApiKey}`,
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
                  'Authorization': `Bearer ${newApiKey}`,
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
                  'Authorization': `Bearer ${secondApiKey}`,
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
                  'Authorization': `Bearer ${secondApiKey}`,
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
                user_id: userid,
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
    }, 1500)
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
    
    // 存储收集到的信息到localStorage，供ProfilePage使用
    const travelPlanInfo = {
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
    const baseUrl = 'http://172.30.32.1:8080'
    const apiKey = 'application-671304ec532e25e706b4cd654b104fb7'
    
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
    
    // 打印发送的消息内容
    // console.log('发送的消息内容:', messages.value[messages.value.length - 1].content)
    
    // 处理流式响应
    const reader = chatResponse.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let collectedContent = ''
    let isStreamComplete = false
    
    while (!isStreamComplete) {
      const { done, value } = await reader.read()
      if (done) {
        isStreamComplete = true
        break
      }
      
      // 解码接收到的数据块
      const chunk = decoder.decode(value, { stream: true })
      
      // 分割多个data块
      const dataChunks = chunk.split('data: ').filter(Boolean)
      
      for (const dataChunk of dataChunks) {
        try {
          // 解析每个data块的JSON
          const parsedData = JSON.parse(dataChunk)
          
          // 检查是否有有用的content
          if (parsedData.content && parsedData.content.trim()) {
            collectedContent += parsedData.content
            
            // 实时更新消息内容，移除quick_question标签
            let currentContent = collectedContent
              .replace(/<quick_question>/g, '')
              .replace(/<\/quick_question>/g, '')
              .trim()
            
            // 实时更新消息
            messages.value[streamingMessageIndex].content = formatMarkdownForVue(currentContent)
            
            // 打印更新的消息内容
            // console.log('更新的消息内容:', messages.value[streamingMessageIndex].content)
            
            // 滚动到底部以显示最新内容
            await nextTick()
            scrollToBottom()
          }
          
          // 检查是否是最后一个数据块
          if (parsedData.is_end) {
            isStreamComplete = true
          }
        } catch (e) {
          console.error('解析数据块失败:', e)
        }
      }
    }
    
    // 最终处理收集到的内容
    let planContent = collectedContent
      .replace(/<quick_question>/g, '')
      .replace(/<\/quick_question>/g, '')
      .trim()
      
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
    .replace(/^## (.*$)/gm, '<h3 class="markdown-h3">$1</h3>')
    .replace(/^### (.*$)/gm, '<h4 class="markdown-h4">$1</h4>')
    .replace(/^#### (.*$)/gm, '<h5 class="markdown-h5">$1</h5>')
    
  // 处理加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // 处理列表
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>')
  // 将连续的li标签包装在ul中
  html = html.replace(/(<li>.*?<\/li>)(?=<li>|<\/ul>|$)/gs, '<ul>$1</ul>')
  
  // 处理代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  // 处理引用
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  
  // 处理分隔线
  html = html.replace(/^---$/gm, '<hr class="markdown-hr">')
  
  // 处理段落（确保每个非HTML块的行都用p标签包裹）
  const lines = html.split('\n')
  const result = []
  let inList = false
  let currentParagraph = ''
  
  for (let line of lines) {
    line = line.trim()
    
    if (line.startsWith('<h') || line.startsWith('<ul>') || line.startsWith('<blockquote>') || line.startsWith('<pre>') || line.startsWith('<hr')) {
      // 如果有当前段落，先保存
      if (currentParagraph) {
        result.push(`<p>${currentParagraph}</p>`)
        currentParagraph = ''
      }
      result.push(line)
      inList = line.startsWith('<ul>')
    } else if (line === '</ul>') {
      result.push(line)
      inList = false
    } else if (line === '' && !inList) {
      // 空行，结束当前段落
      if (currentParagraph) {
        result.push(`<p>${currentParagraph}</p>`)
        currentParagraph = ''
      }
    } else if (line && !inList) {
      // 普通文本行，添加到当前段落
      if (currentParagraph) currentParagraph += ' '
      currentParagraph += line
    } else if (line) {
      // 在列表中，直接添加
      result.push(line)
    }
  }
  
  // 保存最后一个段落
  if (currentParagraph) {
    result.push(`<p>${currentParagraph}</p>`)
  }
  
  return result.join('\n')
}

// 根据问题索引提取用户回答 - 修正逻辑
const extractAnswerByIndex = (questionIndex) => {
  // 查找第N个用户消息作为答案
  let userAnswerCount = 0
  for (const msg of messages.value) {
    if (msg.type === 'user') {
      if (userAnswerCount === questionIndex) {
        return msg.content
      }
      userAnswerCount++
    }
  }
  return '未指定'
}

// 清空聊天记录
const clearChat = () => {
  messages.value = []
  currentQuestionIndex.value = 0
  message.value = ''
  isGeneratingPlan.value = false
  sendWelcomeMessage()
}

// 组件挂载时初始化登录状态并检查
onMounted(() => {
  // 初始化登录状态
  loginStore.initializeAuth()
  
  // 检查是否已登录
  if (loginStore.isAuthenticated()) {
    sendWelcomeMessage()
    
  } else {
    // 未登录时显示登录弹窗
    showLoginModal.value = true
  }
})

// 处理登录成功
const handleLoginSuccess = () => {
  sendWelcomeMessage()
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
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 聊天头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.status-text {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.header-btn:hover {
  background-color: #f0f0f0;
}

.header-icon {
  font-size: 1.1rem;
  color: #666;
}

/* 聊天内容区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-circle.user {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.avatar-icon {
  font-size: 1.5rem;
  color: white;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message-bubble {
  padding: 1rem 1.25rem;
  border-radius: 18px;
  word-wrap: break-word;
}

.ai-message .message-bubble {
  background-color: white;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-message .message-bubble p {
  color: white !important;
  z-index: 1;
  position: relative;
}

.user-text {
  color: white !important;
  z-index: 1;
  position: relative;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
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
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-align: left;
}

.option-btn:hover {
  background-color: #667eea;
  border-color: #667eea;
  color: white;
  transform: translateY(-1px);
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
  background-color: #667eea;
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
  color: #333;
}

.message-bubble h3 {
  font-size: 1.1rem;
}

.message-bubble h4 {
  font-size: 1rem;
  color: #555;
}

.message-bubble ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-bubble li {
  margin: 0.25rem 0;
}

.message-bubble strong {
  color: #667eea;
}

/* Markdown样式 */
.markdown-h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.markdown-h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
  margin: 1.2rem 0 0.8rem 0;
}

.markdown-h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin: 1rem 0 0.6rem 0;
}

.message-bubble ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.message-bubble li {
  margin: 0.5rem 0;
  line-height: 1.5;
  position: relative;
}

.message-bubble blockquote {
  border-left: 4px solid #667eea;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
  font-style: italic;
}

.message-bubble pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.message-bubble code {
  font-family: 'Courier New', monospace;
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 2rem 0;
}

/* 底部输入区域 */
.chat-input-area {
  background-color: white;
  border-top: 1px solid #e0e0e0;
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
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 1rem;
  resize: none;
  outline: none;
  font-family: inherit;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.message-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  background: #ccc;
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
  color: #999;
}

.question-progress {
  color: #667eea !important;
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
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>