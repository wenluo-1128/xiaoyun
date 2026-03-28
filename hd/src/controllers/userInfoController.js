const logger = require('../config/logger');
const { pool } = require('../config/database');

async function queryUserInfoByUserId(req, res) {
  let client = null;
  
  try {
    const { userid } = req.validatedParams;
    
    logger.info('Querying user_info records', { 
      userid,
      request_id: req.requestId
    });
    
    client = await pool.connect();
    
    const query = `
      SELECT id, userid, query_keyword, depart_time, destination, the_count, budget, theme
      FROM user_info
      WHERE userid = $1
      ORDER BY id DESC
    `;
    
    const result = await client.query(query, [userid]);
    
    logger.info('User info query completed', { 
      userid,
      record_count: result.rows.length,
      request_id: req.requestId
    });
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    logger.error('Error querying user_info:', { 
      error: error.message,
      stack: error.stack,
      request_id: req.requestId
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

async function insertUserInfo(req, res) {
  let client = null;
  
  try {
    const { userid, query_keyword, depart_time, destination, the_count, budget, theme } = req.validatedParams;
    
    logger.info('Inserting user_info record', { 
      userid,
      query_keyword,
      request_id: req.requestId
    });
    
    client = await pool.connect();
    await client.query('BEGIN');
    
    const insertQuery = `
      INSERT INTO user_info (userid, query_keyword, depart_time, destination, the_count, budget, theme)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, userid, query_keyword, depart_time, destination, the_count, budget, theme
    `;
    
    const result = await client.query(insertQuery, [
      userid, 
      query_keyword, 
      depart_time || null, 
      destination || null, 
      the_count || null, 
      budget || null,
      theme || null
    ]);
    
    await client.query('COMMIT');
    
    const insertedRecord = result.rows[0];
    logger.info('User info inserted successfully', { 
      id: insertedRecord.id,
      userid: insertedRecord.userid,
      request_id: req.requestId
    });
    
    res.status(201).json({
      success: true,
      message: '用户信息插入成功',
      data: insertedRecord
    });
    
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    logger.error('Error inserting user_info:', { 
      error: error.message,
      stack: error.stack,
      request_id: req.requestId
    });
    
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: '记录已存在'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({ 
        success: false, 
        error: '数据库连接错误' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: '插入过程中发生内部服务器错误' 
      });
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  queryUserInfoByUserId,
  insertUserInfo
};
