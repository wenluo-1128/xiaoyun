<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 响应式状态定义
const route = useRoute();
const router = useRouter();
const htmlContent = ref('');
const codeid = ref('');
const userid = ref('');
const loading = ref(true);
const error = ref('');

/**
 * HTML数据处理方法
 * 根据要求实现两项核心处理功能：
 * 1. 将"//n"替换为实际的换行符\n
 * 2. 删除所有出现的"///"字符串
 * @param {string} html - 需要处理的HTML字符串
 * @returns {string} - 处理后的HTML字符串
 * @throws {Error} - 当处理过程中出现严重错误时抛出
 */
const processHtmlData = (html) => {
  // 参数验证：确保输入是有效的字符串
  if (!html || typeof html !== 'string') {
    console.warn('processHtmlData: 无效的HTML输入，必须是字符串类型');
    return '';
  }
  
  try {
    console.log('开始处理HTML数据，原始内容长度:', html.length);
    
    // 按照要求执行两项核心处理：
    // 1. 将"//n"替换为实际的换行符\n
    // 2. 删除所有出现的"///"字符串
    let processedHtml = html
      // 处理1: 将"//n"替换为换行符\n
      .replace(/\/\/n/g, '\n');
      
    // 处理2: 确保删除所有"///"字符串
    // 使用循环确保完全删除所有可能的"///"序列，即使它们是连续的
    while (processedHtml.includes('///')) {
      processedHtml = processedHtml.replace(/\/\/\//g, '');
    }
    
    console.log('HTML数据处理完成，处理后内容长度:', processedHtml.length);
    return processedHtml;
  } catch (err) {
    // 详细记录错误信息
    console.error('HTML数据处理出错:', err);
    console.error('错误堆栈:', err.stack);
    
    // 发生错误时返回原始内容，确保功能不中断
    console.warn('处理失败，返回原始内容以保证功能正常运行');
    return html;
  }
};

/**
 * HTML安全处理函数
 * 提供基本的安全处理，保留样式和脚本，但移除潜在的危险内联事件处理器
 * 
 * @param {string} html - 需要进行安全处理的HTML字符串
 * @returns {string} - 经过安全处理的HTML字符串
 */
const sanitizeHtml = (html) => {
  if (!html) return '';
  
  console.log('开始HTML安全处理，内容长度:', html.length);
  
  try {
    // 基础的HTML安全处理 - 根据要求保留所有样式和脚本
    // 只移除内联事件处理器以保持基本安全
    let sanitized = html
      // 移除内联事件处理器，防止XSS攻击
      .replace(/on\w+\s*=\s*["']?[^"'>\s]+["']?/gi, '')
      // 确保HTML标签格式正确
      .replace(/<\s*(\w+)/g, '<$1')
      .replace(/<\/(\w+)\s*>/g, '</$1>')
      // 确保属性引号完整
      .replace(/(\w+)=([^"'\s>]+)/g, '$1="$2"')
      // 修复可能的HTML实体编码问题
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    console.log('HTML安全处理完成，内容长度:', sanitized.length);
    return sanitized;
  } catch (err) {
    console.error('HTML安全处理出错:', err);
    // 发生错误时返回原始内容，确保功能不中断
    return html;
  }
};

/**
 * 执行嵌入式脚本函数
 * 从渲染后的HTML中提取并安全执行script标签内容
 */
const executeEmbeddedScripts = () => {
  try {
    console.log('开始执行嵌入式脚本处理');
    
    // 获取所有在HTML内容中的script标签内容
    const div = document.createElement('div');
    div.innerHTML = htmlContent.value;
    const scripts = div.querySelectorAll('script');
    
    console.log(`找到 ${scripts.length} 个嵌入式脚本需要执行`);
    
    // 清除之前可能添加的脚本，避免重复执行导致的问题
    document.querySelectorAll('.dynamic-script').forEach(script => {
      try {
        script.remove();
      } catch (e) {
        console.warn('清理旧脚本时出现错误:', e);
      }
    });
    
    // 执行每个脚本
    scripts.forEach((script, index) => {
      try {
        // 检查脚本内容是否为空
        if (!script.textContent && !script.src) {
          console.warn(`脚本 ${index + 1} 为空，跳过执行`);
          return;
        }
        
        const newScript = document.createElement('script');
        newScript.className = 'dynamic-script';
        
        // 复制原始脚本的属性（跳过内联事件处理器）
        Array.from(script.attributes).forEach(attr => {
          if (!attr.name.startsWith('on') && (attr.name !== 'src' || script.src)) {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        // 设置脚本内容
        if (script.textContent) {
          newScript.textContent = script.textContent;
        }
        
        // 添加到文档中执行
        document.head.appendChild(newScript);
        console.log(`脚本 ${index + 1} 执行中...`);
        
        // 执行后移除，避免重复执行
        setTimeout(() => {
          try {
            newScript.remove();
            console.log(`脚本 ${index + 1} 执行完毕并已清理`);
          } catch (cleanupError) {
            console.error(`清理脚本 ${index + 1} 时出错:`, cleanupError);
          }
        }, 1000);
      } catch (scriptError) {
        console.error(`执行脚本 ${index + 1} 时出错:`, scriptError);
        // 继续执行下一个脚本，不中断整个过程
      }
    });
    
    console.log(`脚本处理完成，共处理 ${scripts.length} 个脚本`);
  } catch (err) {
    // 捕获整体执行过程中的错误
    console.error('执行嵌入式脚本过程中出现严重错误:', err);
    // 不抛出错误，避免影响主要功能
  }
};

/**
 * 返回按钮处理函数
 * 导航回上一页
 */
const handleBack = () => {
  try {
    router.back();
  } catch (err) {
    console.error('返回导航失败:', err);
    // 如果返回失败，尝试使用window.history.back()
    if (window && window.history) {
      window.history.back();
    }
  }
};

/**
 * 从测试文件加载数据的专用函数
 * 提供模拟数据用于开发和测试
 * 
 * @returns {Promise<Object>} - 包含HTML内容和元数据的对象
 */
const loadTestData = async () => {
  try {
    console.log('尝试从测试文件加载数据...');
    
    // 使用完整的测试数据内容，确保使用实际换行符
    const testFileContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>平遥古城2天1夜深度文化体验之旅</title>
  <meta name="description" content="平遥古城2天1夜深度文化体验之旅：明清古建筑群 + 晋商票号文化，预算约450-480元，节奏舒缓，深度沉浸。" />
  <style>
    :root{
      --grad-start:#667eea;
      --grad-end:#764ba2;
      --glass-bg:rgba(255,255,255,0.10);
      --glass-bd:rgba(255,255,255,0.20);
      --text:#f5f7ff;
      --muted:#cbd3ff;
      --accent:#ffd166;
      --ok:#06d6a0;
      --warn:#ff6b6b;
      --shadow: 0 8px 32px 0 rgba(0,0,0,0.10);
      --radius: 16px;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;
      color:var(--text);
      font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif;
      background: linear-gradient(135deg,var(--grad-start),var(--grad-end));
      background-attachment: fixed;
      white-space: pre-wrap;
    }
    a{color:inherit}
    .container{
      max-width:1200px;
      margin:0 auto;
      padding:24px;
    }
    .glass{
      background:var(--glass-bg);
      border:1px solid var(--glass-bd);
      border-radius:var(--radius);
      box-shadow:var(--shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      position:relative;
      overflow:hidden;
      margin-bottom:24px;
      padding:24px;
    }
    /* 确保文本中的换行符正确显示 */
    p, div {white-space: pre-wrap;margin:12px 0;}
    /* 紫色主题的卡片、布局等关键样式 */
    .section-title{font-size:18px;font-weight:600;margin-bottom:16px;color:var(--accent);}
    .title{font-size:24px;margin-bottom:12px;}
    .subtitle{font-size:16px;color:var(--muted);}
    .budget-items{display:flex;flex-direction:column;gap:8px;}
    .budget-item{padding:8px 12px;background:var(--glass-bg);border-radius:8px;}
    .itinerary{display:flex;flex-direction:column;gap:24px;}
    .day h3{margin-bottom:12px;color:var(--accent);}
  </style>
</head>
<body>
  <div class="container">
    <header class="nav glass">
      <div class="brand">
        <div class="logo" aria-hidden="true">🏮</div>
        <div>
          <div style="font-size:16px;line-height:1.1">平遥古城2天1夜深度文化体验之旅</div>
          <small class="muted">明清古建筑群 · 晋商票号文化 · 预算约450-480元</small>
        </div>
      </div>
    </header>
    
    <!-- 行程内容的关键部分 - 包含测试数据用于验证换行符处理 -->
    <section class="hero">
      <div class="glass">
        <h1 class="title">搜索结果 · 行程总览</h1>
        <p class="subtitle">平遥古城拥有完整的明清建筑群，是中国保存最完整的古代县城，非常符合您对古建筑与历史的文化重点需求。</p>
        <p>预计时间：半天或全天
//n适合季节：春秋两季最佳
//n游览建议：提前1天预约，带上舒适的步行鞋</p>
        <p>///注意事项：门票需要提前在线预约，///周末人流量较大，建议错峰出行。</p>
      </div>
      
      <div class="glass card">
        <div class="section-title">💸 预算控制（总计：480元）</div>
        <div class="budget-items">
          <div class="budget-item">交通费用：120元</div>
          <div class="budget-item">住宿费用：180元</div>
          <div class="budget-item">门票费用：150元</div>
          <div class="budget-item">餐饮费用：30元</div>
        </div>
      </div>
      
      <div class="glass card">
        <div class="section-title">📅 行程安排</div>
        <div class="itinerary">
          <div class="day">
            <h3>第一天</h3>
            <p>上午：参观明清街、日昇昌票号///
//n中午：品尝当地特色面食
//n下午：参观古城墙、县衙博物馆</p>
          </div>
          <div class="day">
            <h3>第二天</h3>
            <p>上午：参观城隍庙、文庙
//n中午：享用午餐后返程</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`;
    
    return {
      html: testFileContent,
      query_keyword: 'test-plan',
      userid: 'test-user'
    };
  } catch (error) {
    console.error('加载测试数据失败:', error);
    // 重新抛出错误，由调用方处理
    throw error;
  }
};

/**
 * 加载数据的主函数
 * 从API或测试数据源获取HTML内容，处理后渲染到页面
 */
const loadData = async () => {
  try {
    // 重置状态
    loading.value = true;
    error.value = '';
    
    // 从路由参数中获取 userid 和 codeid
    const { userid: uid, codeid: qk } = route.params;
    userid.value = uid;
    codeid.value = qk; // 保留codeid变量兼容性
    
    console.log('加载旅行计划数据:', { userid: uid, codeid: qk });
    
    // 测试模式：当URL参数中包含test=true或参数不完整时，使用测试数据
    const useTestData = route.query.test === 'true' || (!uid || !qk);
    
    let data;
    
    if (useTestData) {
      console.log('使用测试数据模式');
      // 加载测试数据
      data = await loadTestData();
      console.log('测试数据加载成功');
    } else {
      // 验证参数
      if (!uid || !qk) {
        throw new Error('参数错误：缺少必要的用户ID或计划代码');
      }
      
      // 构建请求URL
      const url = `/query/html?userid=${uid}&query_keyword=${qk}`;
      
      // 发送请求
      const response = await fetch(url);
      
      // 检查响应状态
      if (!response.ok) {
        console.error('请求失败，状态码:', response.status);
        
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `服务器错误，状态码: ${response.status}`);
        } catch (e) {
          // 如果无法解析JSON，使用默认错误消息
          throw new Error(`服务器返回错误状态码 ${response.status}`);
        }
      }
      
      // 尝试解析JSON响应
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON解析错误:', jsonError);
        throw new Error('数据格式错误：无法解析服务器返回的JSON数据');
      }
    }
    
    // 提取数据
    if (!data.html) {
      console.warn('返回的数据中没有HTML内容');
      throw new Error(data.error || '未找到对应的旅行计划内容');
    } else {
      // 处理返回的HTML内容
      console.log('开始处理HTML内容，原始数据大小:', data.html.length);
      
      // 步骤1: 使用新的数据处理方法进行核心处理
      const processedHtml = processHtmlData(data.html);
      console.log('使用processHtmlData处理完成');
      
      // 步骤2: 保留基本的安全处理
      const sanitizedHtml = sanitizeHtml(processedHtml);
      console.log('安全处理完成，准备构建最终HTML内容');
      
      // 步骤3: 创建包含完整HTML结构的内容，确保紫色主题样式正确应用
      // 首先提取原始样式内容
      const styleContentMatch = sanitizedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      const originalStyleContent = styleContentMatch ? styleContentMatch[1] : '';
      
      console.log('提取到的样式内容长度:', originalStyleContent.length);
      
      // 步骤4: 构建最终HTML内容，确保紫色主题样式正确应用
      const finalHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* 确保基础样式正确应用，增加CSS变量优先级 */
    :root {
      --grad-start: #6a0dad; /* 紫色主题起始色 */
      --grad-end: #9370db;   /* 紫色主题结束色 */
      --glass-bg: rgba(255,255,255,0.15);
      --glass-bd: rgba(255,255,255,0.20);
      --text: #ffffff;
      --muted: #e0e0ff;
      --accent: #ffd166;
      --ok: #06d6a0;
      --warn: #ff6b6b;
      --error: #f44336;
      --shadow: 0 8px 32px 0 rgba(0,0,0,0.15);
      --radius: 16px;
      --spacing: 16px;
    }
    
    /* 基础重置 */
    html, body {
      margin: 0;
      padding: 0;
      height: auto;
      min-height: 100%;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
      font-size: 16px;
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    /* 紫色渐变背景 - 增加优先级 */
    body.purple-theme {
      background: linear-gradient(135deg, var(--grad-start), var(--grad-end)) !important;
      background-attachment: fixed !important;
      color: var(--text) !important;
      white-space: pre-wrap !important;
      padding: var(--spacing) !important;
      min-height: 100vh !important;
      margin: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif !important;
    }
    
    /* 确保所有文本元素都正确处理换行符 - 关键样式 */
    p, div, h1, h2, h3, h4, h5, h6, span, li, strong, em, b, i, blockquote {
      white-space: pre-wrap !important;
      word-wrap: break-word;
      overflow: visible;
      line-height: 1.8;
    }
    
    /* 添加原始样式内容 */
    ${originalStyleContent}
  </style>
</head>
<body class="purple-theme">
  <div class="content-wrapper">
    ${sanitizedHtml}
  </div>
</body>
</html>`;
      
      htmlContent.value = finalHtml;
      console.log('成功获取并处理HTML内容，样式已优化，最终HTML内容大小:', finalHtml.length);
      
      // 添加内容验证
      if (!htmlContent.value || htmlContent.value.length < 100) {
        console.warn('渲染的HTML内容可能不完整，内容长度:', htmlContent.value?.length);
      }
      
      // 延迟执行以确保DOM已经渲染
      setTimeout(() => {
        console.log('开始执行嵌入式脚本');
        executeEmbeddedScripts();
      }, 500);
    }
    
    // 更新元数据
    if (data.query_keyword) {
      codeid.value = data.query_keyword;
    }
    
    if (data.userid) {
      userid.value = data.userid;
    }
    
  } catch (err) {
    // 统一错误处理
    console.error('加载旅行计划失败:', err);
    error.value = err.message || '未知错误';
    htmlContent.value = `<div class="error-message">加载失败：${err.message || '未知错误'}</div>`;
  } finally {
    // 无论成功与否，都结束加载状态
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  console.log('TravelPlanView组件已挂载，开始加载数据');
  loadData();
});
</script>

<template>
  <div class="travel-plan-view">
    <!-- 返回按钮 -->
    <button @click="handleBack" class="back-button">
      ← 返回
    </button>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
    </div>
    
    <!-- 内容展示 -->
    <div v-else class="content-container">
      <div class="metadata">
        <span v-if="userid" class="meta-item">用户ID: {{ userid }}</span>
        <span v-if="codeid" class="meta-item">计划ID: {{ codeid }}</span>
      </div>
      <div class="html-content" v-html="htmlContent"></div>
    </div>
  </div>
</template>

<style scoped>
.travel-plan-view {
  position: relative;
  min-height: 100vh;
  /* 移除背景色，让内部HTML的紫色主题能够正常显示 */
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.back-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.back-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 20px 30px;
  border-radius: 8px;
  font-size: 18px;
  border: 1px solid #fecaca;
}

.content-container {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

.metadata {
  position: fixed;
  top: 10px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 99;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* 移除过多的all: revert规则，避免样式冲突 */
/* 直接允许内部HTML元素使用自己的样式 */
:deep(.html-content) {
  width: 100%;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  position: relative;
  z-index: 1;
}

/* 仅为内部元素提供基础样式，不覆盖原有的样式 */
:deep(.html-content) > * {
  width: 100%;
  box-sizing: border-box;
}

/* 确保卡片等元素能够正常显示 */
:deep(.card),
:deep(.glass) {
  /* 不使用all: revert，允许内部样式正常应用 */
  display: block;
}

/* 确保文本元素能够正确显示 */
:deep(.html-content) p,
:deep(.html-content) div,
:deep(.html-content) h1,
:deep(.html-content) h2,
:deep(.html-content) h3 {
  white-space: pre-wrap !important;
  word-break: break-word;
  line-height: 1.6;
}

/* 确保容器能够正常显示 */
:deep(.html-content) .container {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 24px !important;
}

.meta-item {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.html-content {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
}

/* 确保脚本能够正常执行 */
:deep(.html-content) script {
  display: block;
  visibility: hidden;
  height: 0;
  width: 0;
}
</style>