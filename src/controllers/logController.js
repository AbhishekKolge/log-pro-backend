const { StatusCodes } = require('http-status-codes');
const { Prisma } = require('@prisma/client');

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
    queryObject.where.statusMessage = {
      in: ['OK', 'Not Modified'],
    };
  }
  if (status === 'failed') {
    queryObject.where.NOT = {
      statusMessage: {
        in: ['OK', 'Not Modified'],
      },
    };
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

  let period = 'DAY';

  if (customUtils.isWeekRange(new Date(+startDate), new Date(+endDate))) {
    period = 'HOUR';
  }
  if (customUtils.isDayRange(new Date(+startDate), new Date(+endDate))) {
    period = 'MINUTE';
  }

  const user = await prisma.$queryRaw(
    Prisma.sql`
    SELECT COUNT(DISTINCT "Log"."remoteAddress")::INT AS count 
    FROM "Log" WHERE "Log"."createdAt" BETWEEN ${Prisma.raw(
      `'${new Date(+startDate).toISOString()}'`
    )} AND ${Prisma.raw(`'${new Date(+endDate).toISOString()}'`)}
    AND "Log"."userId" = ${req.user.userId};
  `
  );

  const request = await prisma.$queryRaw(
    Prisma.sql`
    SELECT DATE_TRUNC(${Prisma.raw(
      `'${period}'`
    )}, "Log"."createdAt") AS created, COUNT("Log"."id")::INT AS count
    FROM "Log"
    WHERE "Log"."createdAt" BETWEEN ${Prisma.raw(
      `'${new Date(+startDate).toISOString()}'`
    )} AND ${Prisma.raw(`'${new Date(+endDate).toISOString()}'`)}
    AND "Log"."userId" = ${req.user.userId}
    GROUP BY DATE_TRUNC(${Prisma.raw(`'${period}'`)}, "Log"."createdAt")
    ORDER BY created;
  `
  );

  const failedRequest = await prisma.$queryRaw(
    Prisma.sql`
    SELECT DATE_TRUNC(${Prisma.raw(
      `'${period}'`
    )}, "Log"."createdAt") AS created, COUNT("Log"."id")::INT AS count
    FROM "Log"
    WHERE "Log"."createdAt" BETWEEN ${Prisma.raw(
      `'${new Date(+startDate).toISOString()}'`
    )} AND ${Prisma.raw(`'${new Date(+endDate).toISOString()}'`)}
    AND "Log"."userId" = ${req.user.userId}
    AND "Log"."statusMessage" != 'OK' AND "Log"."statusMessage" != 'Not Modified'
    GROUP BY DATE_TRUNC(${Prisma.raw(`'${period}'`)}, "Log"."createdAt")
    ORDER BY created;
  `
  );

  res.status(StatusCodes.OK).json({
    user,
    request,
    failedRequest,
  });
};

module.exports = {
  addLog,
  getLogs,
  getAnalytics,
};
