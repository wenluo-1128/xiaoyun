const express = require('express');
const router = express.Router();
const {
  registerUser,
  queryUser
} = require('../controllers/usersController');
const {
  validateUserRegistration
} = require('../middleware/validation');

router.post('/users/register', validateUserRegistration, registerUser);
router.post('/users/login', queryUser);

module.exports = router;
