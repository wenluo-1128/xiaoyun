// 测试Markdown处理函数
const testMarkdown = `**行程总览：** 
* **主题：** 风花雪月间的白族风情* **目的地：** 云南大理* **节奏：** 中等，每日2-3个核心体验点，松弛有度* **适配人群：** 注重文化体验与自然风光的家庭游客--- 

### **第1天：古城漫步与白族建筑美学** 

**上午** 
* **地点：大理古城** 
  * **体验解读：** 作为大理的文化核心，古城不仅展现了现代商业活力，更保留了传统街巷格局。这里可以初步感受白族"现代融合型"的生活气息，家人可以悠闲地逛逛特色小店，为接下来的文化体验预热。 
  * **体验时长：**2.5小时 * **参与方式：** 自由游览，可从南门进入，沿复兴路、人民路、洋人街漫步。 
  * **注意事项：** 古城内为石板路，建议穿着舒适的平底鞋。夏季紫外线强，注意防晒。 

**下午** 
* **地点：严家大院** 
  * **体验解读：** 这是白族民居建筑艺术的"活化石"，集中体现了"三坊一照壁"、"四合五天井"的格局。院内时常有白族三道茶表演及民俗歌舞，是了解白族文化传说和体验互动环节的绝佳场所，完美契合您的需求。 
  * **体验时长：**2小时 * **参与方式：** 购票入场，可跟随讲解员了解建筑背后的家族故事与文化寓意，并观看三道茶表演。 
  * **注意事项：** 三道茶表演有固定场次，建议提前咨询院方或留意园区公告，以免错过。 

**配套服务** 
* **餐饮：** **醉琉璃·私房菜(大理古城店)**，位于古城内，环境雅致，提供融合创新的白族特色菜，如酸辣鱼、乳扇等，人均消费约80-120元。 
* **住宿：** **大理古城方舟客栈或同级别白族庭院式客栈**，选择古城内或周边的客栈，既能体验白族民居特色，又方便夜间活动和次日出行。 
* **其他配套：** 古城内租借民族服饰拍照，增加家庭互动乐趣。 

**当日贴士** 
* **实用知识点：** 大理古城内主要靠步行或乘坐观光车，无需开车。从古城到严家大院距离极近，步行即可到达。 
* **预算参考：** 当日门票（严家大院）及餐饮约150-250元/人。 
* **预约提醒：**旺季（暑假）期间，古城内热门客栈建议提前2-3天预订。`;

// 复制修改后的格式化函数
const formatMarkdownForVue = (markdown) => {
  // 处理标题
  let html = markdown
    .replace(/^## (.*$)/gm, '<h3 class="markdown-h3">$1</h3>')
    .replace(/^### (.*$)/gm, '<h4 class="markdown-h4">$1</h4>')
    .replace(/^#### (.*$)/gm, '<h5 class="markdown-h5">$1</h5>')
    
  // 处理加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // 处理分隔线
  html = html.replace(/^---$/gm, '<hr class="markdown-hr">')
  
  // 处理代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  // 处理引用
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  
  // 处理列表
  // 首先将所有列表项转换为<li>标签
  html = html.replace(/^(\s*)[\-\*] (.*)$/gm, '$1<li>$2</li>')
  
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
        result += '</ul>\n'
        inList = false
      }
      result += '\n'
      continue
    }
    
    if (trimmedLine.startsWith('<li>')) {
      // 列表项
      if (!inList) {
        // 开始新列表
        result += '<ul class="markdown-list">\n'
        inList = true
        currentIndent = indent
      } else if (indent > currentIndent) {
        // 嵌套列表
        result += '<ul class="markdown-list">\n'
        currentIndent = indent
      } else if (indent < currentIndent) {
        // 结束当前列表，开始新列表
        while (currentIndent > indent) {
          result += '</ul>\n'
          currentIndent -= 2 // 假设缩进为2个空格
        }
      }
      result += line + '\n'
    } else {
      // 非列表项
      if (inList) {
        // 结束当前列表
        while (currentIndent > 0) {
          result += '</ul>\n'
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
    result += '</ul>\n'
    currentIndent -= 2
    if (currentIndent <= 0) {
      inList = false
    }
  }
  
  return result
};

// 测试并输出结果
console.log('原始Markdown:');
console.log(testMarkdown);
console.log('\n处理后的HTML:');
console.log(formatMarkdownForVue(testMarkdown));
