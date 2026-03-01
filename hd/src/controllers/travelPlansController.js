const logger = require('../config/logger');
const { pool } = require('../config/database');

async function getTravelPlans(req, res) {
  try {
    const limit = Number(req.query.limit || 50);
    const queryKeyword = req.query.query_keyword;
    const userid = req.query.userid;
    
    logger.info(`获取行程数据请求: query_keyword=${queryKeyword}, userid=${userid}, limit=${limit}`);
    
    if (!queryKeyword) {
      logger.warn('缺少query_keyword参数');
      return res.status(400).json({ error: 'query_keyword参数是必需的' });
    }
    
    let query, params;
    if (userid) {
      query = `
        SELECT id, plan_data, query_keyword, userid, created_at 
        FROM travel_plans 
        WHERE query_keyword = $1 AND userid = $2 
        ORDER BY created_at DESC 
        LIMIT $3
      `;
      params = [queryKeyword, userid, limit];
    } else {
      query = `
        SELECT id, plan_data, query_keyword, userid, created_at 
        FROM travel_plans 
        WHERE query_keyword = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      params = [queryKeyword, limit];
    }
    
    const r = await pool.query(query, params);
    logger.info(`成功获取${r.rows.length}条行程数据`);
    res.json(r.rows);
  } catch (e) {
    logger.error('获取行程数据时出错:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function createTravelPlan(req, res) {
  try {
    const plan = req.body.plan_data;
    const r = await pool.query(
      'INSERT INTO travel_plans (plan_data, query_keyword) VALUES ($1::jsonb, $2) RETURNING id, plan_data, query_keyword, created_at',
      [plan, req.queryKeyword]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    logger.error('Error creating travel plan:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function updateTravelPlan(req, res) {
  try {
    const id = Number(req.params.id);
    const plan = req.body.plan_data;
    const r = await pool.query(
      'UPDATE travel_plans SET plan_data = $1::jsonb WHERE id = $2 AND query_keyword = $3 RETURNING id, plan_data, query_keyword, created_at',
      [plan, id, req.queryKeyword]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) {
    logger.error('Error updating travel plan:', e);
    res.status(500).json({ error: 'server_error' });
  }
}

async function deleteTravelPlan(req, res) {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      'DELETE FROM travel_plans WHERE id = $1 AND query_keyword = $2 RETURNING id',
      [id, req.queryKeyword]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '未找到旅行计划或未授权' });
    }

    await client.query('COMMIT');
    res.json({ success: true, message: '旅行计划删除成功' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error deleting travel plan:', error);
    res.status(500).json({ error: '内部服务器错误' });
  } finally {
    client.release();
  }
}

async function encryptAndStoreTravelPlan(req, res) {
  let client;
  
  try {
    client = await pool.connect();
    const { userid, query_keyword: queryKeyword, ...plan_data } = { ...req.body };
    
    logger.info('Processing travel plan storage request', {
      userid,
      query_keyword: queryKeyword.substring(0, 10) + '...'
    });
    
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO travel_plans (plan_data, query_keyword, userid) 
       VALUES ($1, $2, $3) 
       RETURNING id, created_at`,
      [plan_data, queryKeyword, userid]
    );
    
    await client.query('COMMIT');
    
    const createdRecord = result.rows[0];
    logger.info('Travel plan stored successfully', {
      id: createdRecord.id,
      userid,
      created_at: createdRecord.created_at
    });
    
    res.status(201).json({
      success: true,
      message: '旅行计划存储成功',
      data: {
        id: createdRecord.id,
        query_keyword: queryKeyword,
        userid: userid,
        created_at: createdRecord.created_at
      }
    });
    
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    if (error.code === '22P02') {
      logger.error('Data type error when storing travel plan:', error);
      res.status(400).json({
        success: false,
        error: '请求中的数据类型无效'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      logger.error('Database connection error:', error);
      res.status(503).json({
        success: false,
        error: '数据库连接错误'
      });
    } else {
      logger.error('Error storing travel plan:', error);
      res.status(500).json({
        success: false,
        error: '存储过程中发生内部服务器错误'
      });
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function getTravelPlansByUserId(req, res) {
  const startTime = Date.now();
  let client;
  
  try {
    const { userid } = req.body;
    
    if (!userid) {
      return res.status(400).json({ 
        success: false, 
        error: 'userid parameter is required' 
      });
    }
    
    const numericUserId = Number(userid);
    if (isNaN(numericUserId) || numericUserId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'userid must be a positive number' 
      });
    }
    
    client = await pool.connect();
    
    const query = 'SELECT * FROM travel_plans WHERE userid = $1 ORDER BY created_at DESC';
    const result = await client.query(query, [numericUserId]);
    
    const responseTime = Date.now() - startTime;
    logger.info('Travel plans retrieved successfully', {
      userid: numericUserId,
      count: result.rows.length,
      response_time: responseTime
    });
    
    if (responseTime > 400) {
      logger.warn('Slow API response', {
        endpoint: '/api/data/user',
        response_time: responseTime,
        userid: numericUserId
      });
    }
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      response_time: responseTime
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Error querying travel plans by userid:', {
      error: error.message,
      response_time: responseTime,
      stack: error.stack
    });
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({ 
        success: false, 
        error: '数据库连接错误' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: '查询过程中发生内部服务器错误' 
      });
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  getTravelPlans,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
  encryptAndStoreTravelPlan,
  getTravelPlansByUserId
};
