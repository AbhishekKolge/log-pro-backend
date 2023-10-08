const express = require('express');

const { addLog } = require('../controllers/logController');
const {
  authenticateLoggerMiddleware,
} = require('../middleware/authentication');
const { addLogSchema } = require('../validation/log');
const { validateRequest } = require('../middleware/validate-request');

const router = express.Router();

router
  .route('/')
  .post([authenticateLoggerMiddleware, addLogSchema, validateRequest], addLog);

module.exports = router;
