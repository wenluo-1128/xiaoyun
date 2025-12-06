// 测试脚本：测试根据userid查询行程计划的接口
const axios = require('axios');
const assert = require('assert');

// 配置测试环境
const API_URL = 'http://localhost:3005/api/data/user';
const API_KEY = process.env.API_KEY || 'default_api_key';

// 测试用例
async function runTests() {
  console.log('开始测试根据userid查询行程计划的接口...');
  
  try {
    // 测试1: 缺少userid参数
    console.log('测试1: 缺少userid参数');
    try {
      const response = await axios.post(API_URL, {}, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      assert.fail('应该返回400错误');
    } catch (error) {
      assert.strictEqual(error.response.status, 400, '应该返回400状态码');
      assert.strictEqual(error.response.data.error, 'userid parameter is required', '错误消息不正确');
      console.log('✅ 测试1通过');
    }
    
    // 测试2: 无效的userid（非数字）
    console.log('测试2: 无效的userid（非数字）');
    try {
      const response = await axios.post(API_URL, { userid: 'invalid' }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      assert.fail('应该返回400错误');
    } catch (error) {
      assert.strictEqual(error.response.status, 400, '应该返回400状态码');
      assert.strictEqual(error.response.data.error, 'userid must be a positive number', '错误消息不正确');
      console.log('✅ 测试2通过');
    }
    
    // 测试3: 无效的userid（负数）
    console.log('测试3: 无效的userid（负数）');
    try {
      const response = await axios.post(API_URL, { userid: -123 }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      assert.fail('应该返回400错误');
    } catch (error) {
      assert.strictEqual(error.response.status, 400, '应该返回400状态码');
      assert.strictEqual(error.response.data.error, 'userid must be a positive number', '错误消息不正确');
      console.log('✅ 测试3通过');
    }
    
    // 测试4: 有效但不存在的userid（应该返回空数组）
    console.log('测试4: 有效但不存在的userid');
    const response4 = await axios.post(API_URL, { userid: 999999 }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    assert.strictEqual(response4.status, 200, '应该返回200状态码');
    assert.ok(response4.data.success, 'success字段应该为true');
    assert.ok(Array.isArray(response4.data.data), 'data字段应该是数组');
    assert.strictEqual(response4.data.count, 0, 'count字段应该为0');
    console.log('✅ 测试4通过');
    
    // 测试5: 缺少认证头
    console.log('测试5: 缺少认证头');
    try {
      const response = await axios.post(API_URL, { userid: 12345 });
      assert.fail('应该返回401错误');
    } catch (error) {
      assert.strictEqual(error.response.status, 401, '应该返回401状态码');
      console.log('✅ 测试5通过');
    }
    
    // 测试6: 无效的认证头
    console.log('测试6: 无效的认证头');
    try {
      const response = await axios.post(API_URL, { userid: 12345 }, {
        headers: {
          'Authorization': 'Bearer invalid_key',
          'Content-Type': 'application/json'
        }
      });
      assert.fail('应该返回401错误');
    } catch (error) {
      assert.strictEqual(error.response.status, 401, '应该返回401状态码');
      console.log('✅ 测试6通过');
    }
    
    console.log('🎉 所有测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { runTests };