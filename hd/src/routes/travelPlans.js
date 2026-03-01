const express = require('express');
const router = express.Router();
const {
  getTravelPlans,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
  encryptAndStoreTravelPlan,
  getTravelPlansByUserId
} = require('../controllers/travelPlansController');
const {
  requireKeyword,
  validatePlan,
  validateJsonData,
  validateTravelPlanRequest
} = require('../middleware/validation');
const {
  rateLimiterMiddleware
} = require('../middleware/security');

router.get('/data', requireKeyword, getTravelPlans);
router.post('/data', requireKeyword, validatePlan, createTravelPlan);
router.put('/data/:id', requireKeyword, validatePlan, updateTravelPlan);
router.delete('/data/:id', requireKeyword, deleteTravelPlan);
router.post('/data/encrypt', validateJsonData, validateTravelPlanRequest, encryptAndStoreTravelPlan);
router.post('/data/user', rateLimiterMiddleware, getTravelPlansByUserId);

module.exports = router;
