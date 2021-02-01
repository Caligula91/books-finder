const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const nocache = require('nocache');
const enforce = require('express-sslify');

const booksRouter = require('./routes/booksRoutes');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

if (process.env.ENFORCE_SECURE === 'yes') app.use(enforce.HTTPS());
/**
 *  1) GLOBAL MIDDLEWARES
 */

// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.knjige.com, front-end knjige.com
// app.use(cors({
//   origin: 'https://www.knjige.com'
// }))
app.options('*', cors());

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Limit requests from same API
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// DISABLE CACHE !!!!!!!!!
if (process.env.BROWSER_CACHE === 'no') app.use(nocache());

app.use(compression());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // eslint-disable-next-line no-console
  console.log(process.env.NODE_ENV.toUpperCase());
}

app.use('/', viewRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
