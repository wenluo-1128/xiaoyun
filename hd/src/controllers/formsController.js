const logger = require('../config/logger');
const { pool } = require('../config/database');
const { sanitizeHtml } = require('../utils/security');
const { monitoredDbOperation } = require('../middleware/monitoring');

async function getHtmlContent(req, res) {
  try {
    const userid = req.query.userid;
    const queryKeyword = req.query.query_keyword;
    
    logger.info(`获取HTML内容请求: userid=${userid}, query_keyword=${queryKeyword}`);
    
    if (!userid || !queryKeyword) {
      logger.warn('缺少必需参数: userid或query_keyword');
      return res.status(400).json({ error: 'userid和query_keyword参数是必需的' });
    }
    
    const query = `
      SELECT html, codeid, userid 
      FROM html 
      WHERE userid = $1 AND codeid = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userid, queryKeyword]);
    
    if (result.rows.length === 0) {
      logger.warn(`未找到用户${userid}的query_keyword=${queryKeyword}对应的HTML内容`);
      return res.status(404).json({ error: '未找到对应的HTML内容' });
    }
    
    const htmlData = result.rows[0];
    logger.info(`成功获取用户${userid}的HTML内容，query_keyword=${queryKeyword}`);
    
    res.status(200).json({
      html: htmlData.html,
      query_keyword: htmlData.codeid,
      userid: htmlData.userid
    });
  } catch (error) {
    logger.error('Error retrieving HTML content:', error);
    res.status(500).json({ error: '内部服务器错误' });
  }
}

async function submitFormData(req, res) {
  let client;
  
  try {
    const { userid, codeid, html, code } = req.body;
    logger.info('Received form data submission', { userid, codeid });

    client = await pool.connect();
    
    await client.query('BEGIN');
    
    try {
      const sanitizedHtml = sanitizeHtml(html);
      
      const insertQuery = `
        INSERT INTO html (userid, codeid, html, code, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, userid, codeid, created_at
      `;
      
      const result = await client.query(insertQuery, [
        userid, 
        codeid, 
        sanitizedHtml, 
        code || null
      ]);
      
      await client.query('COMMIT');
      
      const insertedRecord = result.rows[0];
      logger.info('Form data inserted successfully', { 
        recordId: insertedRecord.id,
        userid: insertedRecord.userid,
        codeid: insertedRecord.codeid
      });
      
      res.status(201).json({
        success: true,
        message: '表单数据提交成功',
        data: {
          id: insertedRecord.id,
          userid: insertedRecord.userid,
          codeid: insertedRecord.codeid,
          created_at: insertedRecord.created_at
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Database transaction failed, rolled back', { error: error.message });
      throw error;
    }
  } catch (error) {
    logger.error('Error submitting form data:', error);
    
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: '该codeid的记录已存在'
      });
    } else if (error.code) {
      res.status(500).json({
        success: false,
        error: `数据库错误：${error.message}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: '内部服务器错误'
      });
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  getHtmlContent,
  submitFormData
};
