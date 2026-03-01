const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const rateLimitMiddleware = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false
});

function rateLimiterMiddleware(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const key = `rate_limit:${ip}`;
    
    if (!global.rateLimitStore) {
      global.rateLimitStore = {};
    }
    
    if (!global.rateLimitStore[key]) {
      global.rateLimitStore[key] = [];
    }
    
    global.rateLimitStore[key] = global.rateLimitStore[key].filter(time => now - time < 60000);
    
    if (global.rateLimitStore[key].length >= 10) {
      logger.warn('Rate limit exceeded', { ip });
      return res.status(429).json({
        success: false,
        error: '请求频率超限，请稍后再试'
      });
    }
    
    global.rateLimitStore[key].push(now);
    
    res.setHeader('X-RateLimit-Limit', 10);
    res.setHeader('X-RateLimit-Remaining', 10 - global.rateLimitStore[key].length);
    res.setHeader('X-RateLimit-Reset', Math.floor((now + 60000) / 1000));
    
    next();
  } catch (error) {
    logger.error('Error in rate limiter middleware:', error);
    next();
  }
}

function basicAuthMiddleware(req, res, next) {
  try {
    const expectedApiKey = process.env.API_KEY || 'default_api_key';
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      logger.warn('Authorization请求头缺失');
      return res.status(401).json({
        success: false,
        error: '需要身份验证'
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Authorization请求头格式无效');
      return res.status(401).json({
        success: false,
        error: '身份验证格式无效。预期格式为Bearer token。'
      });
    }
    
    const apiKey = authHeader.split(' ')[1];
    if (apiKey !== expectedApiKey) {
      logger.warn('无效的API密钥');
      return res.status(401).json({
        success: false,
        error: '无效的API密钥'
      });
    }
    
    next();
  } catch (error) {
    logger.error('基本身份验证中间件出错:', error);
    res.status(500).json({
      success: false,
      error: '身份验证错误'
    });
  }
}

module.exports = {
  rateLimitMiddleware,
  rateLimiterMiddleware,
  basicAuthMiddleware
};
