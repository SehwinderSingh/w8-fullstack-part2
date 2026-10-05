const logger = require('../utils/logger');

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

const requestLogger = (req, res, next) => {
  const safeBody = { ...req.body };

  if (safeBody.password) {
    safeBody.password = "[REDACTED]";
  }
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', safeBody);
  logger.info('---');
  next();
};

module.exports = { unknownEndpoint, errorHandler, requestLogger };

