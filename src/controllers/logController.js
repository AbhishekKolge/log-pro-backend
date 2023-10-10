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

const getLogs = async (req, res) => {
  const { search, status, method, processingTime, sort } = req.query;

  const queryObject = {
    where: {
      userId: req.user.userId,
    },
    orderBy: [],
  };
  if (search) {
    queryObject.where.url = {
      startsWith: search,
      mode: 'insensitive',
    };
  }
  if (status === 'successful') {
    queryObject.where.statusMessage = 'OK';
  }
  if (status === 'failed') {
    queryObject.where.statusMessage = { not: 'OK' };
  }
  if (method) {
    queryObject.where.method = {
      equals: method,
      mode: 'insensitive',
    };
  }
  if (processingTime === 'highest') {
    queryObject.orderBy.push({
      processingTime: 'desc',
    });
  }
  if (processingTime === 'lowest') {
    queryObject.orderBy.push({
      processingTime: 'asc',
    });
  }
  switch (sort) {
    case 'newest': {
      queryObject.orderBy.push({
        createdAt: 'desc',
      });
      break;
    }
    case 'oldest': {
      queryObject.orderBy.push({
        createdAt: 'asc',
      });
      break;
    }
    default: {
      queryObject.orderBy.push({
        createdAt: 'desc',
      });
      break;
    }
  }

  const page = +req.query.page || 1;
  const take = 10;
  const skip = (page - 1) * take;

  const logs = await prisma.log.findMany({ skip, take, ...queryObject });

  const totalLogs = await prisma.log.count({
    ...queryObject,
  });
  const numOfPages = Math.ceil(totalLogs / take);

  res.status(StatusCodes.OK).json({
    logs,
    totalLogs,
    numOfPages,
  });
};

const getAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;

  const users = await prisma.log.findMany({
    distinct: ['remoteAddress'],
    where: {
      createdAt: {
        gte: new Date(+startDate),
        lte: new Date(+endDate),
      },
      userId: req.user.userId,
    },
    select: {
      createdAt: true,
      id: true,
    },
  });

  const request = await prisma.log.findMany({
    where: {
      createdAt: {
        gte: new Date(+startDate),
        lte: new Date(+endDate),
      },
      userId: req.user.userId,
    },
    select: {
      createdAt: true,
      id: true,
    },
  });

  const failedRequest = await prisma.log.findMany({
    where: {
      createdAt: {
        gte: new Date(+startDate),
        lte: new Date(+endDate),
      },
      statusMessage: {
        not: 'OK',
      },
      userId: req.user.userId,
    },
    select: {
      createdAt: true,
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    usersCount: users.length,
    users,
    requestCount: request.length,
    request,
    failedRequestCount: failedRequest.length,
    failedRequest,
  });
};

module.exports = {
  addLog,
  getLogs,
  getAnalytics,
};
