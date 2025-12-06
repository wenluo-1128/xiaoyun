/**
 * 测试文件：验证HTML数据处理逻辑
 * 此文件用于测试TravelPlanView.vue中的processHtmlData函数
 */

// 复制TravelPlanView.vue中的processHtmlData函数实现
function processHtmlData(htmlContent) {
  /**
   * 处理HTML内容中的特殊字符串
   * @param {string} htmlContent - 需要处理的HTML字符串
   * @returns {string} - 处理后的HTML字符串
   * @throws {Error} - 当输入参数无效时抛出错误
   */
  try {
    // 参数验证
    if (!htmlContent || typeof htmlContent !== 'string') {
      throw new Error('参数错误：需要有效的HTML字符串');
    }

    // 核心数据处理逻辑
    let processedContent = htmlContent;
    
    // 1. 先将'//n'替换为换行符
    processedContent = processedContent.replace(/\/\/n/g, '\n');
    
    // 2. 确保删除所有'///'字符串
    // 使用循环确保完全删除所有可能的'///'序列，即使它们是连续的
    while (processedContent.includes('///')) {
      processedContent = processedContent.replace(/\/\/\//g, '');
    }
    
    // 验证处理后的内容是否为空
    if (processedContent.trim() === '') {
      console.warn('警告：处理后的HTML内容为空');
    }
    
    return processedContent;
  } catch (error) {
    console.error('处理HTML数据时发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

// 测试用例集合
const testCases = [
  {
    name: '测试用例1: 基本功能验证 - 删除///和替换//n',
    input: '<p>这是一段测试文本///包含特殊字符串//n这应该显示在新行</p>',
    expected: '<p>这是一段测试文本包含特殊字符串\n这应该显示在新行</p>'
  },
  {
    name: '测试用例2: 多次出现的特殊字符',
    input: '///第一段///文本//n//n第二段文本///',
    expected: '第一段文本\n\n第二段文本'
  },
  {
    name: '测试用例3: 嵌套在HTML标签中的特殊字符',
    input: '<div class="test///class">内容//n继续</div>',
    expected: '<div class="testclass">内容\n继续</div>'
  },
  {
    name: '测试用例4: 连续的特殊字符',
    input: '//////////n//n//////////n',
    expected: '//\n\n//\n'
  },
  {
    name: '测试用例5: 没有特殊字符的普通文本',
    input: '普通文本内容，没有特殊字符需要处理',
    expected: '普通文本内容，没有特殊字符需要处理'
  },
  {
    name: '测试用例6: 空字符串输入',
    input: '',
    shouldThrow: true,
    errorMessage: '参数错误：需要有效的HTML字符串'
  },
  {
    name: '测试用例7: null输入',
    input: null,
    shouldThrow: true,
    errorMessage: '参数错误：需要有效的HTML字符串'
  },
  {
    name: '测试用例8: 数字输入',
    input: 12345,
    shouldThrow: true,
    errorMessage: '参数错误：需要有效的HTML字符串'
  },
  {
    name: '测试用例9: 复杂HTML结构',
    input: `<!DOCTYPE html>
<html>
<head>
  <title>测试页面///</title>
</head>
<body>
  <h1>测试标题</h1>//n  
  <p>测试段落包含///特殊字符</p>
</body>
</html>`,
    expected: `<!DOCTYPE html>
<html>
<head>
  <title>测试页面</title>
</head>
<body>
  <h1>测试标题</h1>
  
  <p>测试段落包含特殊字符</p>
</body>
</html>`
  },
  {
    name: '测试用例10: 处理后的空内容警告',
    input: '///',
    expected: '',
    shouldWarn: true
  }
];

// 运行测试
function runTests() {
  console.log('开始运行HTML处理函数测试...');
  console.log('==================================');
  
  let passedTests = 0;
  const totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n测试 ${index + 1}/${totalTests}: ${testCase.name}`);
    
    try {
      // 捕获console.warn调用以测试警告情况
      let warningCaught = false;
      const originalWarn = console.warn;
      console.warn = (...args) => {
        warningCaught = true;
        originalWarn(...args);
      };
      
      // 执行测试
      const result = processHtmlData(testCase.input);
      
      // 恢复原始的console.warn
      console.warn = originalWarn;
      
      // 检查是否应该抛出异常但没有抛出
      if (testCase.shouldThrow) {
        console.error('❌ 测试失败：预期会抛出异常，但没有抛出');
        return;
      }
      
      // 验证结果
      const passed = result === testCase.expected;
      
      if (passed) {
        // 检查是否应该有警告
        if (testCase.shouldWarn && !warningCaught) {
          console.warn('⚠️  测试通过，但预期会有警告');
        } else if (testCase.shouldWarn && warningCaught) {
          console.log('✅ 测试通过，且成功捕获警告');
          passedTests++;
        } else {
          console.log('✅ 测试通过');
          passedTests++;
        }
      } else {
        console.error('❌ 测试失败');
        console.error('  期望输出:', JSON.stringify(testCase.expected));
        console.error('  实际输出:', JSON.stringify(result));
      }
    } catch (error) {
      // 检查是否预期会抛出异常
      if (testCase.shouldThrow) {
        if (error.message === testCase.errorMessage) {
          console.log('✅ 测试通过：成功抛出预期的异常');
          passedTests++;
        } else {
          console.error('❌ 测试失败：抛出了异常，但错误消息不匹配');
          console.error('  期望消息:', testCase.errorMessage);
          console.error('  实际消息:', error.message);
        }
      } else {
        console.error('❌ 测试失败：意外抛出异常');
        console.error('  错误:', error.message);
      }
    }
  });
  
  console.log('\n==================================');
  console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！');
  } else {
    console.log('❌ 有测试失败，请检查代码。');
  }
}

// 执行测试
if (require.main === module) {
  runTests();
}

// 导出函数以便在其他地方使用（如果需要）
module.exports = { processHtmlData, runTests };