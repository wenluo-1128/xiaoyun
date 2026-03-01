const Joi = require('joi');
const logger = require('../config/logger');
const { sanitizeHtml } = require('../utils/security');

function requireKeyword(req, res, next) {
  const q = req.query.query_keyword || req.body.query_keyword;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'query_keyword是必填参数' });
  }
  req.queryKeyword = q;
  next();
}

function validateJsonData(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: '请求数据无效：请求体必须是有效的JSON对象'
      });
    }

    if (!req.body.hasOwnProperty('userid')) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段：userid'
      });
    }

    if (typeof req.body.userid !== 'number' || req.body.userid <= 0) {
      return res.status(400).json({
        success: false,
        error: '无效的userid：必须是正整数'
      });
    }

    next();
  } catch (error) {
    logger.error('验证请求数据时出错:', error);
    return res.status(400).json({
      success: false,
      error: 'JSON数据格式无效'
    });
  }
}

const attractionSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  time: Joi.string().required(),
  lnglat: Joi.array().items(Joi.number()).length(2).required(),
  desc: Joi.string().required()
});

const daySchema = Joi.object({
  day: Joi.number().required(),
  title: Joi.string().required(),
  attractions: Joi.array().items(attractionSchema).required()
});

const tripInfoSchema = Joi.object({
  location: Joi.string().required(),
  total_days: Joi.number().required(),
  total_attractions: Joi.number().required(),
  description: Joi.string().required()
});

const planSchema = Joi.object({
  trip_title: Joi.string().required(),
  days: Joi.array().items(daySchema).required(),
  trip_info: tripInfoSchema.required()
});

function validatePlan(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { error } = planSchema.validate(req.body.plan_data);
    if (error) return res.status(400).json({ error: 'invalid plan_data' });
  }
  next();
}

function validateTravelPlanRequest(req, res, next) {
  try {
    const travelPlanRequestSchema = Joi.object({
      userid: Joi.alternatives().try(
        Joi.string().required(),
        Joi.number().required()
      ).required(),
      query_keyword: Joi.string().min(1).required()
    }).unknown(true);

    const validationResult = travelPlanRequestSchema.validate(req.body);

    if (validationResult.error) {
      logger.warn('旅行计划请求参数验证失败:', validationResult.error.details);
      return res.status(400).json({
        success: false,
        error: validationResult.error.details.map(detail => detail.message).join(', ')
      });
    }

    next();
  } catch (error) {
    logger.error('验证旅行计划请求时出错:', error);
    res.status(400).json({
      success: false,
      error: '验证旅行计划请求失败'
    });
  }
}

function validateFormData(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      logger.warn('Invalid request: body is not a valid JSON object');
      return res.status(400).json({
        success: false,
        error: '请求数据无效：请求体必须是有效的JSON对象'
      });
    }

    const requiredFields = ['userid', 'codeid', 'html'];
    const missingFields = requiredFields.filter(field => !req.body.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      logger.warn(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        error: `缺少必填字段：${missingFields.join(', ')}`
      });
    }

    if (!req.body.userid || !req.body.codeid || !req.body.html) {
      logger.warn('Required fields cannot be empty');
      return res.status(400).json({
        success: false,
        error: 'userid、codeid和html字段不能为空'
      });
    }

    if (typeof req.body.userid !== 'number' && typeof req.body.userid !== 'string') {
      logger.warn('Invalid userid type');
      return res.status(400).json({
        success: false,
        error: 'userid必须是数字或字符串'
      });
    }

    if (typeof req.body.codeid !== 'string' || typeof req.body.html !== 'string') {
      logger.warn('Invalid codeid or html type');
      return res.status(400).json({
        success: false,
        error: 'codeid和html必须是字符串'
      });
    }

    if (typeof req.body.userid === 'string') {
      const numUserid = parseInt(req.body.userid, 10);
      if (!isNaN(numUserid)) {
        req.body.userid = numUserid;
      }
    }

    next();
  } catch (error) {
    logger.error('Error validating form data:', error);
    return res.status(400).json({
      success: false,
      error: '验证表单数据失败'
    });
  }
}

function validateUserRegistration(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: '请求数据无效：请求体必须是有效的JSON对象'
      });
    }

    const requiredFields = ['phone', 'password', 'name'];
    for (const field of requiredFields) {
      if (!req.body.hasOwnProperty(field)) {
        return res.status(400).json({
          success: false,
          error: `缺少必填字段：${field}`
        });
      }
    }

    const { phone, password, name } = req.body;

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (typeof phone !== 'string' || !phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: '无效的手机号格式。请提供有效的中国大陆手机号。'
      });
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 60) {
      return res.status(400).json({
        success: false,
        error: '密码长度必须在6到60个字符之间'
      });
    }

    if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
      return res.status(400).json({
        success: false,
        error: '名字长度必须在1到50个字符之间'
      });
    }

    next();
  } catch (error) {
    logger.error('Error validating user registration data:', error);
    return res.status(400).json({
      success: false,
      error: '无效的用户注册数据格式'
    });
  }
}

function validateIngFormParams(req, res, next) {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const { user_id, codeid, page, page_size, json_data, html_content } = params;
    const validatedParams = {};

    if (user_id === undefined) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数：user_id'
      });
    }

    validatedParams.user_id = Number(user_id);
    if (isNaN(validatedParams.user_id)) {
      return res.status(400).json({
        success: false,
        error: 'user_id必须是有效数字'
      });
    }

    if ((req.path.includes('/update') || req.path.includes('/create')) && codeid === undefined) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数：codeid'
      });
    }

    if (codeid !== undefined) {
      validatedParams.codeid = codeid;
    }

    if (req.path.includes('/query')) {
      validatedParams.page = page ? Number(page) : 1;
      validatedParams.page_size = page_size ? Number(page_size) : 20;

      if (isNaN(validatedParams.page) || validatedParams.page < 1) {
        validatedParams.page = 1;
      }
      if (isNaN(validatedParams.page_size) || validatedParams.page_size < 1 || validatedParams.page_size > 100) {
        validatedParams.page_size = 20;
      }
    }

    if (req.path.includes('/update-json') && json_data !== undefined) {
      try {
        const parsedJson = typeof json_data === 'string' ? JSON.parse(json_data) : json_data;
        if (typeof parsedJson !== 'object' || parsedJson === null) {
          throw new Error('Invalid JSON object');
        }
        validatedParams.json_data = parsedJson;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: '无效的json_data格式'
        });
      }
    }

    if (req.path.includes('/update-html') && html_content !== undefined) {
      if (typeof html_content !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'html_content必须是字符串'
        });
      }
      validatedParams.html_content = html_content;
    }

    req.validatedParams = validatedParams;
    next();
  } catch (error) {
    logger.error('Parameter validation error:', error);
    return res.status(400).json({
      success: false,
      error: '无效的请求参数'
    });
  }
}

function validateJsonDataFormat(req, res, next) {
  try {
    const { json_data } = req.body;
    
    if (!json_data) {
      logger.warn('Missing required parameter: json_data');
      return res.status(400).json({
        success: false,
        error: 'json_data是必填参数'
      });
    }
    
    const parsedJson = typeof json_data === 'string' ? JSON.parse(json_data) : json_data;
    
    if (typeof parsedJson !== 'object' || parsedJson === null) {
      logger.warn('Invalid json_data format: not a valid JSON object');
      return res.status(400).json({
        success: false,
        error: 'json_data必须是有效的JSON对象'
      });
    }
    
    req.validatedParams.json_data = parsedJson;
    next();
  } catch (error) {
    logger.warn('Invalid JSON format', { error: error.message });
    res.status(400).json({
      success: false,
      error: '无效的JSON格式：' + error.message
    });
  }
}

function validateHtmlContent(req, res, next) {
  try {
    const { html_content } = req.body;
    
    if (!html_content) {
      logger.warn('Missing required parameter: html_content');
      return res.status(400).json({
        success: false,
        error: 'html_content是必填参数'
      });
    }
    
    if (typeof html_content !== 'string') {
      logger.warn('Invalid html_content format: must be a string');
      return res.status(400).json({
        success: false,
        error: 'html_content必须是字符串'
      });
    }
    
    const sanitizedHtml = sanitizeHtml(html_content);
    req.validatedParams.html_content = sanitizedHtml;
    next();
  } catch (error) {
    logger.error('Error validating HTML content:', error);
    res.status(400).json({
      success: false,
      error: '无效的HTML内容'
    });
  }
}

module.exports = {
  requireKeyword,
  validateJsonData,
  validatePlan,
  validateTravelPlanRequest,
  validateFormData,
  validateUserRegistration,
  validateIngFormParams,
  validateJsonDataFormat,
  validateHtmlContent
};
