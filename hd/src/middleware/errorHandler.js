const logger = require('../config/logger');

function enhancedErrorHandler(err, req, res, next) {
  const startTime = req.startTime || Date.now();
  const responseTime = Date.now() - startTime;

  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user_id: req.validatedParams?.user_id,
    response_time: responseTime + 'ms'
  });

  if (err.name === 'SyntaxError' && err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      error: '请求体中的JSON格式无效',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: '请求体过大'
    });
  }

  if (err.code) {
    switch (err.code) {
      case 'ECONNREFUSED':
      case 'ENOTFOUND':
        return res.status(503).json({
          success: false,
          error: '数据库连接错误'
        });
      case '23505':
        return res.status(409).json({
          success: false,
          error: '冲突：记录已存在'
        });
      case '23503':
        return res.status(400).json({
          success: false,
          error: '外键约束冲突'
        });
      case '22P02':
        return res.status(400).json({
          success: false,
          error: '提供的数据类型无效'
        });
      default:
        return res.status(500).json({
          success: false,
          error: '数据库错误',
          code: process.env.NODE_ENV === 'development' ? err.code : undefined
        });
    }
  }

  if (err.isBusinessError) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: err.message
    });
  }

  if (err.message && err.message.includes('timeout')) {
    return res.status(504).json({
      success: false,
      error: '请求超时'
    });
  }

  res.status(500).json({
    success: false,
    error: '内部服务器错误',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
}

function globalErrorHandler(err, req, res, next) {
  try {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    if (err.name === 'SyntaxError' && err instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        error: '请求体中的JSON格式无效',
        details: err.message
      });
    }

    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        error: '请求体过大'
      });
    }

    if (err.code) {
      switch (err.code) {
        case 'ECONNREFUSED':
        case 'ENOTFOUND':
          return res.status(503).json({
            success: false,
            error: '数据库连接错误'
          });
        case '23505':
          return res.status(409).json({
            success: false,
            error: '冲突：记录已存在'
          });
        case '23503':
          return res.status(400).json({
            success: false,
            error: '外键约束冲突'
          });
        default:
          return res.status(500).json({
            success: false,
            error: '数据库错误',
            code: err.code
          });
      }
    }

    res.status(500).json({
      success: false,
      error: '内部服务器错误',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  } catch (errorHandlerError) {
    console.error('Error in error handler:', errorHandlerError);
    res.status(500).json({
      success: false,
      error: '严重服务器错误'
    });
  }
}

function notFoundHandler(req, res, next) {
  logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    error: '路由未找到'
  });
}

module.exports = {
  enhancedErrorHandler,
  globalErrorHandler,
  notFoundHandler
};
