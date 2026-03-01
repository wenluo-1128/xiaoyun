const bcrypt = require('bcrypt');
const logger = require('../config/logger');
const { pool } = require('../config/database');

async function registerUser(req, res) {
  const client = await pool.connect();
  
  try {
    const { phone, password, name } = req.body;
    
    await client.query('BEGIN');
    
    const checkPhoneResult = await client.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );
    
    if (checkPhoneResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '手机号已注册'
      });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await client.query(
      `INSERT INTO users (phone, password, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, phone, name, created_at, updated_at`,
      [phone, hashedPassword, name]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: '用户注册成功',
      data: {
        id: result.rows[0].id,
        phone: result.rows[0].phone,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: '用户注册过程中发生内部服务器错误'
    });
  } finally {
    client.release();
  }
}

async function queryUser(req, res) {
  try {
    const { phone, password } = req.body;
    logger.info('Received login request', { phone });

    if (!phone || typeof phone !== 'string') {
      logger.warn('Invalid phone parameter', { phone });
      return res.status(400).json({ success: false, error: '手机号是必填参数' });
    }
    
    if (!password || typeof password !== 'string') {
      logger.warn('Password parameter missing or invalid', { phone });
      return res.status(400).json({ success: false, error: '密码是必填参数' });
    }

    const query = 'SELECT id, phone, name, password, avatar_path, created_at, updated_at FROM users WHERE phone = $1';
    const result = await pool.query(query, [phone]);

    if (result.rows.length === 0) {
      logger.info('User not found', { phone });
      return res.status(401).json({ success: false, error: '手机号或密码错误' });
    }

    const userData = result.rows[0];
    const storedPassword = userData.password;
    
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    
    if (!isPasswordValid) {
      logger.warn('Invalid password attempt', { phone, userId: userData.id });
      return res.status(401).json({ success: false, error: '手机号或密码错误' });
    }
    
    const { password: _, ...safeUserData } = userData;
    
    logger.info('Login successful', { userId: userData.id, phone });
    res.json({ 
      success: true, 
      message: '登录成功',
      data: safeUserData 
    });
  } catch (error) {
    logger.error('Error during user login:', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: '登录过程中发生内部服务器错误' });
  }
}

module.exports = {
  registerUser,
  queryUser
};
