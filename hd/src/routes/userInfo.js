const express = require('express');
const router = express.Router();
const {
  queryUserInfoByUserId,
  insertUserInfo
} = require('../controllers/userInfoController');
const {
  validateUserInfoParams,
  validateUserInfoInsert
} = require('../middleware/validation');
const {
  requestIdMiddleware,
  performanceMonitor
} = require('../middleware/monitoring');

router.post('/user-info/query', requestIdMiddleware, performanceMonitor, validateUserInfoParams, queryUserInfoByUserId);
router.post('/user-info/insert', requestIdMiddleware, performanceMonitor, validateUserInfoInsert, insertUserInfo);

module.exports = router;
