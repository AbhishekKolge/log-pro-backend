const Joi = require('joi').extend(require('@joi/date'));

const addLogSchema = (req, res, next) => {
  const schema = Joi.object().keys({
    timestamp: Joi.date(),
    processingTime: Joi.number().integer(),
    rawHeaders: Joi.string(),
    body: Joi.string().allow(null, ''),
    httpVersion: Joi.string(),
    method: Joi.string(),
    remoteAddress: Joi.string(),
    remoteFamily: Joi.string(),
    url: Joi.string(),
    statusCode: Joi.number().integer(),
    statusMessage: Joi.string(),
    headers: Joi.string(),
    errorData: Joi.string().allow(null, ''),
  });

  req.schema = schema;

  next();
};

module.exports = {
  addLogSchema,
};
