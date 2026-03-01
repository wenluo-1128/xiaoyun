const express = require('express');
const router = express.Router();
const {
  getHtmlContent,
  submitFormData
} = require('../controllers/formsController');
const {
  validateFormData
} = require('../middleware/validation');
const {
  rateLimiterMiddleware,
  basicAuthMiddleware
} = require('../middleware/security');

router.get('/query/html', getHtmlContent);
router.post('/submit-form-data', rateLimiterMiddleware, basicAuthMiddleware, validateFormData, submitFormData);

module.exports = router;
