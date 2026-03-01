const express = require('express');
const router = express.Router();
const {
  queryIngForms,
  updateJsonData,
  updateHtmlContent,
  createIngFormRecord
} = require('../controllers/ingFormsController');
const {
  validateIngFormParams,
  validateJsonDataFormat,
  validateHtmlContent
} = require('../middleware/validation');
const {
  requestIdMiddleware,
  performanceMonitor
} = require('../middleware/monitoring');

router.get('/ing-forms/query', requestIdMiddleware, performanceMonitor, validateIngFormParams, queryIngForms);
router.post('/ing-forms/update-json', requestIdMiddleware, performanceMonitor, validateIngFormParams, validateJsonDataFormat, updateJsonData);
router.post('/ing-forms/update-html', requestIdMiddleware, performanceMonitor, validateIngFormParams, validateHtmlContent, updateHtmlContent);
router.post('/ing-forms/create', requestIdMiddleware, performanceMonitor, validateIngFormParams, createIngFormRecord);

module.exports = router;
