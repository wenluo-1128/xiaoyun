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
    res.status(500).json({ error: '内部服务器错误' });
  }
}

async function createTravelPlan(req, res) {
  let client;

  try {
    const planData = req.body.plan_data;
    const queryKeyword = req.queryKeyword;

    logger.info('更新行程数据请求', { query_keyword: queryKeyword });

    if (!queryKeyword || typeof queryKeyword !== 'string' || queryKeyword.trim() === '') {
      logger.warn('缺少或无效的query_keyword参数');
      return res.status(400).json({
        success: false,
        error: 'query_keyword参数是必需的且必须是非空字符串'
      });
    }

    if (!planData || typeof planData !== 'object') {
      logger.warn('缺少或无效的plan_data字段');
      return res.status(400).json({
        success: false,
        error: 'plan_data字段是必需的且必须是有效的JSON对象'
      });
    }

    client = await pool.connect();

    await client.query('BEGIN');

    const searchQuery = `
      SELECT id, plan_data, query_keyword, userid, created_at
      FROM travel_plans
      WHERE query_keyword = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const searchResult = await client.query(searchQuery, [queryKeyword.trim()]);

    if (searchResult.rows.length === 0) {
      await client.query('ROLLBACK');
      logger.warn('未找到匹配查询关键词的行程数据', { query_keyword: queryKeyword });
      return res.status(404).json({
        success: false,
        error: '未找到匹配查询关键词的行程数据'
      });
    }

    const existingRecord = searchResult.rows[0];

    const updateQuery = `
      UPDATE travel_plans
      SET plan_data = $1::jsonb
      WHERE id = $2 AND query_keyword = $3
      RETURNING id, plan_data, query_keyword, userid, created_at
    `;
    const updateResult = await client.query(updateQuery, [
      JSON.stringify(planData),
      existingRecord.id,
      queryKeyword.trim()
    ]);

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      logger.error('数据更新失败，未能更新任何记录');
      return res.status(500).json({
        success: false,
        error: '数据更新失败'
      });
    }

    await client.query('COMMIT');

    const updatedRecord = updateResult.rows[0];
    logger.info('行程数据更新成功', {
      id: updatedRecord.id,
      query_keyword: updatedRecord.query_keyword,
      userid: updatedRecord.userid
    });

    res.status(200).json({
      success: true,
      message: '行程数据更新成功',
      data: {
        id: updatedRecord.id,
        plan_data: updatedRecord.plan_data,
        query_keyword: updatedRecord.query_keyword,
        userid: updatedRecord.userid,
        created_at: updatedRecord.created_at
      }
    });

  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error('回滚事务时出错:', rollbackError);
      }
    }

    logger.error('更新行程数据时出错:', error);

    if (error.code === '22P02') {
      return res.status(400).json({
        success: false,
        error: '提供的数据类型无效'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: '数据库连接错误'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: '更新行程数据时发生内部服务器错误'
      });
    }
  } finally {
    if (client) {
      client.release();
    }
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
    if (r.rows.length === 0) return res.status(404).json({ error: '未找到旅行计划' });
    res.json(r.rows[0]);
  } catch (e) {
    logger.error('更新旅行计划时出错:', e);
    res.status(500).json({ error: '内部服务器错误' });
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
    const { plan_data, query_keyword, userid } = req.body;

    logger.info('Processing travel plan storage request', {
      userid,
      query_keyword: query_keyword ? query_keyword.substring(0, 10) + '...' : null
    });

    if (!plan_data || typeof plan_data !== 'object') {
      logger.warn('Invalid or missing plan_data field');
      return res.status(400).json({
        success: false,
        error: 'plan_data字段是必需的且必须是有效的JSON对象'
      });
    }

    if (!query_keyword || typeof query_keyword !== 'string' || query_keyword.trim() === '') {
      logger.warn('Invalid or missing query_keyword field');
      return res.status(400).json({
        success: false,
        error: 'query_keyword字段是必需的且必须是非空字符串'
      });
    }

    if (userid === undefined || userid === null) {
      logger.warn('Missing userid field');
      return res.status(400).json({
        success: false,
        error: 'userid字段是必需的'
      });
    }

    const numericUserId = Number(userid);
    if (isNaN(numericUserId) || numericUserId <= 0) {
      logger.warn('Invalid userid format', { userid });
      return res.status(400).json({
        success: false,
        error: 'userid必须是正整数'
      });
    }

    client = await pool.connect();

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO travel_plans (plan_data, query_keyword, userid)
       VALUES ($1::jsonb, $2, $3)
       RETURNING id, plan_data, query_keyword, userid, created_at`,
      [JSON.stringify(plan_data), query_keyword.trim(), numericUserId]
    );

    await client.query('COMMIT');

    const createdRecord = result.rows[0];
    logger.info('Travel plan stored successfully', {
      id: createdRecord.id,
      userid: createdRecord.userid,
      query_keyword: createdRecord.query_keyword,
      created_at: createdRecord.created_at
    });

    res.status(201).json({
      success: true,
      message: '旅行计划存储成功',
      data: {
        id: createdRecord.id,
        plan_data: createdRecord.plan_data,
        query_keyword: createdRecord.query_keyword,
        userid: createdRecord.userid,
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
      return res.status(400).json({
        success: false,
        error: '请求中的数据类型无效'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      logger.error('Database connection error:', error);
      return res.status(503).json({
        success: false,
        error: '数据库连接错误'
      });
    } else if (error.code === '23505') {
      logger.error('Duplicate entry error:', error);
      return res.status(409).json({
        success: false,
        error: '数据已存在，请勿重复提交'
      });
    } else {
      logger.error('Error storing travel plan:', error);
      return res.status(500).json({
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
        error: 'userid 参数是必需的' 
      });
    }
    
    const numericUserId = Number(userid);
    if (isNaN(numericUserId) || numericUserId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'userid 必须是正整数' 
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
