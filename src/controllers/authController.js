const { StatusCodes } = require('http-status-codes');

const prisma = require('../../prisma/prisma-client');

const CustomError = require('../errors');
const customUtils = require('../utils');
const modelMethods = require('../model-methods');

const register = async (req, res) => {
  const verificationToken = customUtils.createRandomOtp();
  console.log({ verificationToken });

  const userModel = new modelMethods.User({
    ...req.body,
    verificationToken: customUtils.hashString(verificationToken),
  });

  await userModel.encryptPassword();

  const user = await prisma.user.create({
    data: userModel.model,
  });

  // await customUtils.sendVerificationEmail({
  //   name: user.name,
  //   email: user.email,
  //   verificationToken,
  // });

  res.status(StatusCodes.CREATED).json({
    msg: `Email verification token sent to ${user.email}`,
  });
};

const verify = async (req, res) => {
  const { email, token } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  if (user.isVerified) {
    throw new CustomError.BadRequestError('Already verified');
  }

  new modelMethods.User(user).compareVerificationToken(
    customUtils.hashString(token)
  );

  await prisma.user.update({
    data: {
      isVerified: true,
      verified: customUtils.currentTime(),
      verificationToken: null,
    },
    where: {
      email,
    },
  });

  res.status(StatusCodes.OK).json({ msg: 'Email verified successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError(
      `${email} does not exist, please register`
    );
  }

  new modelMethods.User(user).checkPasswordTokenValidity();

  const passwordToken = customUtils.createRandomOtp();
  console.log({ passwordToken });

  const tenMinutes = 1000 * 60 * 10;
  const passwordTokenExpiration = Date.now() + tenMinutes;

  await prisma.user.update({
    data: {
      passwordToken: customUtils.hashString(passwordToken),
      passwordTokenExpiration: customUtils.time(passwordTokenExpiration),
    },
    where: {
      email,
    },
  });

  // await customUtils.sendResetPasswordEmail({
  //   name: user.name,
  //   email: user.email,
  //   passwordToken,
  // });

  res
    .status(StatusCodes.OK)
    .json({ msg: `Password reset token sent to ${user.email}` });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  const userModel = new modelMethods.User({
    ...user,
    password,
  });

  userModel.verifyPasswordToken(customUtils.hashString(token));
  await userModel.encryptPassword();

  await prisma.user.update({
    data: {
      password: userModel.model.password,
      passwordToken: null,
      passwordTokenExpiration: null,
    },
    where: {
      email,
    },
  });

  res.status(StatusCodes.OK).json({ msg: 'Password changed successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError(
      `${email} does not exist, please register`
    );
  }

  const userModel = new modelMethods.User(user);

  userModel.checkAuthorized();

  await userModel.comparePassword(password);

  const tokenUser = customUtils.createTokenUser(user);

  customUtils.attachCookiesToResponse({ res, tokenUser });

  res.status(StatusCodes.OK).json({
    msg: 'Logged in successfully',
  });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    maxAge: 0,
  });

  res.status(StatusCodes.OK).json({
    msg: 'Logged out successfully',
  });
};

module.exports = {
  register,
  verify,
  forgotPassword,
  resetPassword,
  login,
  logout,
};
