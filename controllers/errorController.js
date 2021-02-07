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
        problemFields: err.problemFields,
      });
    }
  }
  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  // eslint-disable-next-line
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
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
  const problemFields = {};
  let message = '';
  Object.entries(err.keyValue).forEach(([key, value]) => {
    problemFields[key] = `${value} already exists`;
    message += `${problemFields[key]} `;
  });
  const error = new AppError(message, 400);
  error.problemFields = problemFields;
  return error;
};

const handleValidationErrorDB = (err) => {
  const problemFields = {};
  Object.entries(err.errors).forEach(([key, value]) => {
    problemFields[key] = value.message;
  });

  const message = Object.values(err.errors).map((el) => el.message);
  const error = new AppError(`Invalid Input Data. ${message.join('. ')}`, 400);
  error.problemFields = problemFields;
  return error;
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
