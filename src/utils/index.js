const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const { createTokenUser } = require('./createTokenUser');
const { nodeMailerConfig } = require('./emailConfig');
const { sendEmail } = require('./sendEmail');
const { sendVerificationEmail } = require('./sendVerificationEmail');
const { sendResetPasswordEmail } = require('./sendResetPasswordEmail');
const {
  hashString,
  createRandomBytes,
  createRandomOtp,
  createRandomKey,
} = require('./createHash');
const { removeQuotes } = require('./format');
const { currentTime, checkTimeExpired, time } = require('./time');
const { getUserAgent, getRequestIp, checkTestUser } = require('./requestInfo');
const { Encrypter } = require('./encrypter');

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  nodeMailerConfig,
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  hashString,
  createRandomBytes,
  createRandomOtp,
  createRandomKey,
  getUserAgent,
  getRequestIp,
  checkTestUser,
  removeQuotes,
  currentTime,
  checkTimeExpired,
  time,
  Encrypter,
};
