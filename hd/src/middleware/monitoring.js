const crypto = require('crypto');
const logger = require('../config/logger');
const { encryptSensitiveData } = require('../utils/encryption');

function requestIdMiddleware(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

function advancedMonitoring(req, res, next) {
  req.startTime = Date.now();
  req.dbOperations = [];

  const logData = {
    request_id: req.requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user_agent: req.headers['user-agent']
  };

  if (Object.keys(req.query).length > 0) {
    logData.query_params = encryptSensitiveData(req.query);
  }

  if (Object.keys(req.body).length > 0 && !req.path.includes('/login') && !req.path.includes('/register')) {
    logData.body_params = encryptSensitiveData(req.body);
  }

  logger.info('API Request Received', logData);

  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - req.startTime;

    const responseLog = {
      request_id: req.requestId,
      path: req.path,
      method: req.method,
      status_code: res.statusCode,
      response_time: responseTime + 'ms'
    };

    if (req.validatedParams?.user_id) {
      responseLog.user_id = req.validatedParams.user_id;
    }

    if (req.dbOperations && req.dbOperations.length > 0) {
      const totalDbTime = req.dbOperations.reduce((sum, op) => sum + op.time, 0);
      responseLog.db_operations = {
        count: req.dbOperations.length,
        total_time: totalDbTime + 'ms',
        operations: req.dbOperations.map(op => ({ 
          type: op.type,
          time: op.time + 'ms'
        }))
      };
    }

    if (responseTime > 500) {
      logger.warn('Slow API Response', { ...responseLog, warning: 'Response time exceeds 500ms threshold' });
    } else if (res.statusCode >= 500) {
      logger.error('API Error Response', responseLog);
    } else if (res.statusCode >= 400) {
      logger.warn('API Client Error', responseLog);
    } else {
      logger.info('API Successful Response', responseLog);
    }

    res.setHeader('X-Response-Time', responseTime + 'ms');
    res.setHeader('X-DB-Operations', (req.dbOperations?.length || 0).toString());

    return originalSend.call(this, body);
  };

  const timeoutId = setTimeout(() => {
    const timeoutLog = {
      request_id: req.requestId,
      path: req.path,
      method: req.method,
      elapsed_time: '500ms',
      warning: 'Request approaching timeout threshold'
    };
    logger.warn('Request Timeout Warning', timeoutLog);
  }, 400);

  res.on('finish', () => clearTimeout(timeoutId));

  next();
}

function performanceMonitor(req, res, next) {
  if (!req.requestId) {
    req.requestId = crypto.randomUUID();
  }
  advancedMonitoring(req, res, next);
}

async function monitoredDbOperation(operationType, queryFn, ...args) {
  const startTime = Date.now();
  try {
    let reqContext = null;
    let queryArgs = [...args];

    if (queryArgs.length > 0 && 
        typeof queryArgs[queryArgs.length - 1] === 'object' && 
        queryArgs[queryArgs.length - 1] && 
        queryArgs[queryArgs.length - 1].req) {
      reqContext = queryArgs.pop();
    }

    const result = await queryFn(...queryArgs);
    const endTime = Date.now();

    if (reqContext && reqContext.req && reqContext.req.dbOperations) {
      reqContext.req.dbOperations.push({
        type: operationType,
        time: endTime - startTime
      });
    }

    if (endTime - startTime > 200) {
      logger.warn('Slow Database Operation', {
        operation_type: operationType,
        execution_time: (endTime - startTime) + 'ms'
      });
    }

    return result;
  } catch (error) {
    const endTime = Date.now();
    logger.error('Database Operation Error', {
      operation_type: operationType,
      execution_time: (endTime - startTime) + 'ms',
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  requestIdMiddleware,
  advancedMonitoring,
  performanceMonitor,
  monitoredDbOperation
};
