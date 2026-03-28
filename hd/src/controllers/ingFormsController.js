const logger = require('../config/logger');
const { pool } = require('../config/database');
const { monitoredDbOperation } = require('../middleware/monitoring');

async function queryIngForms(req, res) {
  try {
    const { user_id, page, page_size } = req.validatedParams;
    logger.info('Querying ing forms', { 
      user_id, 
      page, 
      page_size,
      request_id: req.requestId
    });
    
    const offset = (page - 1) * page_size;
    
    const queryResult = await monitoredDbOperation('SELECT', pool.query.bind(pool),
      'SELECT id, json, html, codeid, user_id FROM ing WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
      [user_id, page_size, offset],
      { req }
    );
    
    const countResult = await monitoredDbOperation('COUNT', pool.query.bind(pool),
      'SELECT COUNT(*) FROM ing WHERE user_id = $1',
      [user_id],
      { req }
    );
    
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / page_size);
    
    if (queryResult.rows.length === 0) {
      logger.info('No ing forms found', { 
        user_id,
        request_id: req.requestId
      });
      return res.status(404).json({
        success: false,
        error: '未找到该user_id的记录'
      });
    }
    
    const response = {
      success: true,
      data: queryResult.rows,
      pagination: {
        current_page: page,
        page_size: page_size,
        total_items: totalItems,
        total_pages: totalPages
      }
    };

    logger.info('Query completed successfully', { 
      user_id, 
      records_found: queryResult.rows.length,
      request_id: req.requestId
    });
    
    res.json(response);
  } catch (error) {
    const responseTime = Date.now() - Date.now();
    logger.error('Error querying ing forms:', { error: error.message, response_time: responseTime + 'ms' });
    res.status(500).json({
      success: false,
      error: '内部服务器错误'
    });
  }
}

async function updateJsonData(req, res) {
  let client = null;
  
  try {
    const { user_id, codeid, json_data } = req.validatedParams;
    logger.info('Updating JSON data for ing form', { 
      user_id, 
      codeid,
      request_id: req.requestId
    });
    
    client = await pool.connect();
    await monitoredDbOperation('BEGIN_TRANSACTION', client.query.bind(client),
      'BEGIN',
      [],
      { req }
    );
    
    const findQuery = `
      SELECT id FROM ing WHERE user_id = $1 AND codeid = $2
    `;
    const findResult = await monitoredDbOperation('SELECT', client.query.bind(client),
      findQuery, 
      [user_id, codeid],
      { req }
    );
    
    if (findResult.rows.length === 0) {
      logger.warn('No matching record found for update', { 
        user_id, 
        codeid,
        request_id: req.requestId
      });
      await monitoredDbOperation('ROLLBACK_TRANSACTION', client.query.bind(client),
        'ROLLBACK',
        [],
        { req }
      );
      return res.status(404).json({
        success: false,
        error: '未找到匹配指定user_id和codeid的记录'
      });
    }
    
    const recordId = findResult.rows[0].id;
    const jsonString = JSON.stringify(json_data);
    
    const updateQuery = `
      UPDATE ing 
      SET json = $1 
      WHERE id = $2 
      RETURNING id, json, html, codeid, user_id
    `;
    const updateResult = await monitoredDbOperation('UPDATE', client.query.bind(client),
      updateQuery, 
      [jsonString, recordId],
      { req }
    );
    
    await monitoredDbOperation('COMMIT_TRANSACTION', client.query.bind(client),
      'COMMIT',
      [],
      { req }
    );
    
    logger.info('JSON data updated successfully', { 
      user_id, 
      codeid, 
      record_id: recordId,
      request_id: req.requestId
    });
    
    res.json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    if (client) {
      try {
        await monitoredDbOperation('ROLLBACK_TRANSACTION', client.query.bind(client),
          'ROLLBACK',
          [],
          { req }
        );
      } catch (rollbackError) {
        logger.error('Failed to rollback transaction:', { error: rollbackError.message });
      }
    }
    
    logger.error('Error updating JSON data:', { 
      error: error.message,
      request_id: req.requestId
    });
    
    res.status(500).json({
      success: false,
      error: '内部服务器错误'
    });
  } finally {
    if (client) {
      try {
        client.release();
        logger.debug('Database connection released', { request_id: req.requestId });
      } catch (releaseError) {
        logger.error('Failed to release database connection:', { 
          error: releaseError.message,
          request_id: req.requestId
        });
      }
    }
  }
}

async function updateHtmlContent(req, res) {
  let client = null;
  
  try {
    const { user_id, codeid, html_content } = req.validatedParams;
    logger.info('Updating HTML content for ing form', { 
      user_id, 
      codeid,
      request_id: req.requestId
    });
    
    client = await pool.connect();
    await monitoredDbOperation('BEGIN_TRANSACTION', client.query.bind(client),
      'BEGIN',
      [],
      { req }
    );
    
    const findQuery = `
      SELECT id FROM ing WHERE user_id = $1 AND codeid = $2
    `;
    const findResult = await monitoredDbOperation('SELECT', client.query.bind(client),
      findQuery, 
      [user_id, codeid],
      { req }
    );
    
    if (findResult.rows.length === 0) {
      logger.warn('No matching record found for update', { 
        user_id, 
        codeid,
        request_id: req.requestId
      });
      await monitoredDbOperation('ROLLBACK_TRANSACTION', client.query.bind(client),
        'ROLLBACK',
        [],
        { req }
      );
      return res.status(404).json({
        success: false,
        error: '未找到匹配指定user_id和codeid的记录'
      });
    }
    
    const recordId = findResult.rows[0].id;
    
    const updateQuery = `
      UPDATE ing 
      SET html = $1 
      WHERE id = $2 
      RETURNING id, json, html, codeid, user_id
    `;
    const updateResult = await monitoredDbOperation('UPDATE', client.query.bind(client),
      updateQuery, 
      [html_content, recordId],
      { req }
    );
    
    await monitoredDbOperation('COMMIT_TRANSACTION', client.query.bind(client),
      'COMMIT',
      [],
      { req }
    );
    
    logger.info('HTML content updated successfully', { 
      user_id, 
      codeid, 
      record_id: recordId,
      request_id: req.requestId
    });
    
    res.json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    if (client) {
      try {
        await monitoredDbOperation('ROLLBACK_TRANSACTION', client.query.bind(client),
          'ROLLBACK',
          [],
          { req }
        );
      } catch (rollbackError) {
        logger.error('Failed to rollback transaction:', { error: rollbackError.message });
      }
    }
    
    logger.error('Error updating HTML content:', { 
      error: error.message,
      request_id: req.requestId
    });
    
    res.status(500).json({
      success: false,
      error: '内部服务器错误'
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function createIngFormRecord(req, res) {
  let client = null;
  
  try {
    const { user_id, codeid } = req.validatedParams;
    logger.info('Creating new ing form record', { 
      user_id, 
      codeid,
      request_id: req.requestId
    });
    
    client = await pool.connect();
    await monitoredDbOperation('BEGIN_TRANSACTION', client.query.bind(client),
      'BEGIN',
      { req }
    );
    
    const checkQuery = `
      SELECT id FROM ing WHERE user_id = $1 AND codeid = $2
    `;
    const checkResult = await monitoredDbOperation('SELECT', client.query.bind(client),
      checkQuery, 
      [user_id, codeid],
      { req }
    );
    
    if (!checkResult || !Array.isArray(checkResult.rows)) {
      throw new Error('Invalid database response format');
    }
    
    if (checkResult.rows.length > 0) {
      logger.warn('Record already exists', { 
        user_id, 
        codeid,
        request_id: req.requestId
      });
      await monitoredDbOperation('ROLLBACK_TRANSACTION', client.query.bind(client),
        'ROLLBACK',
        { req }
      );
      return res.status(400).json({
        success: false,
        error: '该user_id和codeid的记录已存在'
      });
    }
    
    const insertQuery = `
      INSERT INTO ing (user_id, codeid, json, html) 
      VALUES ($1, $2, NULL, NULL) 
      RETURNING id, json, html, codeid, user_id
    `;
    const insertResult = await monitoredDbOperation('INSERT', client.query.bind(client),
      insertQuery, 
      [user_id, codeid],
      { req }
    );
    
    if (!insertResult || !Array.isArray(insertResult.rows) || insertResult.rows.length === 0) {
      throw new Error('Failed to create record: no rows returned');
    }
    
    await monitoredDbOperation('COMMIT_TRANSACTION', client.query.bind(client),
      'COMMIT',
      { req }
    );
    
    const createdRecord = insertResult.rows[0];
    logger.info('New ing form record created successfully', { 
      user_id, 
      codeid, 
      record_id: createdRecord.id,
      request_id: req.requestId
    });
    
    res.status(201).json({
      success: true,
      data: createdRecord
    });
  } catch (error) {
    if (client) {
      try {
        await monitoredDbOperation('ROLLBACK_TRANSACTION', client.query.bind(client),
          'ROLLBACK',
          { req }
        );
      } catch (rollbackError) {
        logger.error('Failed to rollback transaction:', { 
          error: rollbackError.message,
          request_id: req.requestId
        });
      }
    }
    
    logger.error('Error creating ing form record:', { 
      error: error.message,
      stack: error.stack,
      user_id: req.validatedParams?.user_id,
      codeid: req.validatedParams?.codeid,
      request_id: req.requestId
    });
    
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      res.status(409).json({
        success: false,
        error: '重复记录：user_id和codeid组合必须唯一'
      });
    } else if (error.message.includes('connection') || error.message.includes('timeout')) {
      res.status(503).json({
        success: false,
        error: '服务暂时不可用'
      });
    } else {
      res.status(500).json({
        success: false,
        error: '内部服务器错误'
      });
    }
  } finally {
    if (client) {
      try {
        client.release();
        logger.debug('Database connection released', { 
          request_id: req.requestId,
          pool_status: { 
            total: pool.totalCount || 'unknown', 
            idle: pool.idleCount || 'unknown', 
            waiting: pool.waitingCount || 'unknown' 
          }
        });
      } catch (releaseError) {
        logger.error('Failed to release database connection:', { 
          error: releaseError.message,
          request_id: req.requestId
        });
      }
    }
  }
}

module.exports = {
  queryIngForms,
  updateJsonData,
  updateHtmlContent,
  createIngFormRecord
};
