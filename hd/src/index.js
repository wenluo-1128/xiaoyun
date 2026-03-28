require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const logger = require('./config/logger');
const { pool, initDatabase } = require('./config/database');
const swaggerSpec = require('./config/swagger');

const { rateLimitMiddleware } = require('./middleware/security');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const travelPlansRoutes = require('./routes/travelPlans');
const usersRoutes = require('./routes/users');
const formsRoutes = require('./routes/forms');
const ingFormsRoutes = require('./routes/ingForms');
const userInfoRoutes = require('./routes/userInfo');
const { getHtmlContent } = require('./controllers/formsController');

const app = express();
const port = Number(process.env.PORT || 3005);

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(rateLimitMiddleware);

app.get('/query/html', getHtmlContent);

//测试用接口，插入测试数据到html表
app.get('/api/test/insert-data', async (req, res) => {
  try {
    const insertQuery = `
      INSERT INTO html (codeid, userid, html, code, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `;
    
    const testHtml = '<div style="font-family: Arial, sans-serif; padding: 20px;"><h1>旅行计划详情</h1><div class="travel-info"><h2>北京三日游</h2><p>这是一个精彩的北京三日游计划，包含了以下景点：</p><ul><li>故宫博物院</li><li>长城</li><li>天坛公园</li><li>颐和园</li><li>王府井大街</li></ul><div class="plan-details"><h3>行程安排</h3><p><strong>第一天：</strong>故宫博物院 - 王府井大街</p><p><strong>第二天：</strong>长城一日游</p><p><strong>第三天：</strong>天坛公园 - 颐和园</p></div><div class="tips"><h3>旅行贴士</h3><p>• 建议提前预订故宫门票</p><p>• 长城游览建议穿舒适的鞋子</p><p>• 带好防晒用品和足够的水</p></div></div></div>';
    
    await pool.query(insertQuery, ['test_plan_001', 12345, testHtml, '北京旅游攻略']);
    logger.info('Test data inserted successfully');
    res.status(200).json({ message: '测试数据插入成功' });
  } catch (error) {
    logger.error('Error inserting test data:', error);
    res.status(500).json({ error: '插入测试数据失败' });
  }
});

app.use('/api', travelPlansRoutes);
app.use('/api', usersRoutes);
app.use('/api', formsRoutes);
app.use('/api', ingFormsRoutes);
app.use('/api', userInfoRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(notFoundHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  initDatabase().finally(() => {
    app.listen(port, () => {
      logger.info(JSON.stringify({ msg: 'server_started', port }));
    });
  });
}

module.exports = app;
