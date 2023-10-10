const express = require('express');

const {
  addLog,
  getLogs,
  getAnalytics,
} = require('../controllers/logController');
const {
  authenticateUserMiddleware,
  authenticateLoggerMiddleware,
} = require('../middleware/authentication');
const { addLogSchema } = require('../validation/log');
const { validateRequest } = require('../middleware/validate-request');
const { testUserMiddleware } = require('../middleware/test-user');

const router = express.Router();

router
  .route('/')
  .get(authenticateUserMiddleware, getLogs)
  .post([authenticateLoggerMiddleware, addLogSchema, validateRequest], addLog);

router.route('/analytics').get(authenticateUserMiddleware, getAnalytics);

module.exports = router;
