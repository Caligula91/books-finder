const AppError = require('../utils/appError');

// PROBLEM!
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  // eslint-disable-next-line
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(500).render('error', {
    status: 'error',
    message: 'Something went very wrong!',
  });
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    /**
     * REMOVE LATER FROM DEV BEGIN
     */
    const problemFields = {};
    if (err.name === 'ValidationError') {
      Object.entries(err.errors).forEach(([key, value]) => {
        problemFields[key] = value.message;
      });
    } else if (err.code === 11000) {
      Object.entries(err.keyValue).forEach(([key, value]) => {
        problemFields[key] = `${value} already exists`;
      });
    }
    /**
     * REMOVE LATER FROM DEV END
     */
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      problemFields,
    });
  }
  // B) RENDERED WEBSITE
  // eslint-disable-next-line
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const handleJWTError = () => {
  return new AppError(
    'Invalid token, try again with valid token or login again',
    401
  );
};
const handleJWTExpiredError = () => {
  return new AppError('Token expired, please login again', 401);
};

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field ${JSON.stringify(err.keyValue)}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid Input Data. ${errors.join('. ')}`, 400);
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.code = err.code;
    error.name = err.name;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
