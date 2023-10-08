const { StatusCodes } = require('http-status-codes');

const prisma = require('../../prisma/prisma-client');

const CustomError = require('../errors');
const customUtils = require('../utils');

const addLog = async (req, res) => {
  const {
    user: { userId },
    body,
  } = req;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }

  body.userId = userId;

  await prisma.log.create({
    data: body,
  });

  res.status(StatusCodes.CREATED).json({
    msg: 'Log added successfully',
  });
};

module.exports = {
  addLog,
};
