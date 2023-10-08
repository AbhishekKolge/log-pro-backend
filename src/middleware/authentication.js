const CustomError = require('../errors');
const customUtils = require('../utils');

const authenticateUserMiddleware = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }

  try {
    const { userId } = customUtils.isTokenValid(token);
    const testUser = customUtils.checkTestUser(userId);
    req.user = { userId, testUser };
    return next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

const authenticateLoggerMiddleware = (req, res, next) => {
  const loggerKey = req.headers['x-auth-token'];

  if (!loggerKey) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }

  try {
    const userId = new customUtils.Encrypter().decrypt(loggerKey);
    const testUser = customUtils.checkTestUser(userId);
    req.user = { userId, testUser };
    return next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

module.exports = {
  authenticateUserMiddleware,
  authenticateLoggerMiddleware,
};
