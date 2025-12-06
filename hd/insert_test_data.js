const { Pool } = require('pg');
const logger = require('winston');

// 配置日志
logger.configure({
  level: 'info',
  format: logger.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'error.log', level: 'error' }),
    new logger.transports.File({ filename: 'combined.log' })
  ]
});

// 数据库连接配置
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432
});

// 插入测试数据
async function insertTestData() {
  try {
    const insertQuery = `
      INSERT INTO html (codeid, userid, html, code, created_at, updated_at)
      VALUES (
        'test_plan_001',
        12345,
        '<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>旅行计划详情</h1>
          <div class="travel-info">
            <h2>北京三日游</h2>
            <p>这是一个精彩的北京三日游计划，包含了以下景点：</p>
            <ul>
              <li>故宫博物院</li>
              <li>长城</li>
              <li>天坛公园</li>
              <li>颐和园</li>
              <li>王府井大街</li>
            </ul>
            <div class="plan-details">
              <h3>行程安排</h3>
              <p><strong>第一天：</strong>故宫博物院 - 王府井大街</p>
              <p><strong>第二天：</strong>长城一日游</p>
              <p><strong>第三天：</strong>天坛公园 - 颐和园</p>
            </div>
            <div class="tips">
              <h3>旅行贴士</h3>
              <p>• 建议提前预订故宫门票</p>
              <p>• 长城游览建议穿舒适的鞋子</p>
              <p>• 带好防晒用品和足够的水</p>
            </div>
          </div>
        </div>',
        '北京旅游攻略',
        NOW(),
        NOW()
      );
    `;
    
    await pool.query(insertQuery);
    logger.info('Test data inserted successfully');
    
    // 查询插入的数据
    const selectQuery = 'SELECT * FROM html WHERE codeid = $1';
    const result = await pool.query(selectQuery, ['test_plan_001']);
    logger.info('Inserted data:', result.rows);
    
  } catch (error) {
    logger.error('Error inserting test data:', error);
  } finally {
    await pool.end();
  }
}

// 执行插入
insertTestData();