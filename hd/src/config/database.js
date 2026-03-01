 const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT || 5432),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000
});

pool.on('acquire', (client) => {
  logger.debug('从连接池获取客户端', { 
    client_id: client.processID,
    pool_status: { 
      total: pool.totalCount, 
      idle: pool.idleCount, 
      waiting: pool.waitingCount 
    } 
  });
});

pool.on('release', (client) => {
  logger.debug('客户端释放回连接池', { 
    client_id: client?.processID,
    pool_status: { 
      total: pool.totalCount, 
      idle: pool.idleCount, 
      waiting: pool.waitingCount 
    } 
  });
});

pool.on('error', (err, client) => {
  logger.error('空闲数据库客户端发生意外错误', { 
    error: err.message,
    client_id: client?.processID 
  });
});

async function initDatabase() {
  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS travel_plans (id SERIAL PRIMARY KEY, plan_data JSONB NOT NULL, query_keyword VARCHAR(255) NOT NULL, userid INT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)'
    );
    
    const columnExists = await pool.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = \'travel_plans\' AND column_name = \'userid\''
    );
    
    if (columnExists.rows.length === 0) {
      await pool.query('ALTER TABLE travel_plans ADD COLUMN userid INT');
      logger.info('已为travel_plans表添加userid字段');
    }
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS html (
        id SERIAL PRIMARY KEY,
        codeid VARCHAR(255) NOT NULL,
        userid INT,
        html TEXT NOT NULL,
        code VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_html_codeid ON html(codeid);
      CREATE INDEX IF NOT EXISTS idx_html_userid ON html(userid);
    `);
    
    logger.info('数据库初始化成功');
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase };
