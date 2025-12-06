#!/usr/bin/env node

/**
 * 测试运行脚本
 * 用于执行项目中的单元测试
 */

const { exec } = require('child_process');
const path = require('path');

console.log('Starting tests for submit-form-data endpoint...');

// 检查测试目录是否存在
const testDir = path.join(__dirname, 'test');
const fs = require('fs');

if (!fs.existsSync(testDir)) {
  console.error('Test directory not found!');
  process.exit(1);
}

// 运行Jest测试
const testCommand = 'npx jest test/submit-form-data.test.js --coverage';

console.log(`Executing: ${testCommand}`);

exec(testCommand, { cwd: __dirname }, (error, stdout, stderr) => {
  if (stderr) {
    console.error('Test errors:');
    console.error(stderr);
  }
  
  if (stdout) {
    console.log('Test output:');
    console.log(stdout);
  }
  
  if (error) {
    console.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  } else {
    console.log('Tests completed successfully!');
    process.exit(0);
  }
});

// 测试用例示例命令（供用户参考）
console.log('\nAdditional test commands:');
console.log('1. Run specific test: npx jest test/submit-form-data.test.js -t "应该成功提交有效数据并返回201状态码"');
console.log('2. Run all tests: npx jest');
console.log('3. Run with coverage: npx jest --coverage');
console.log('4. Run in watch mode: npx jest --watch');