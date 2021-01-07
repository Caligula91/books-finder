const OS = require('os');
require('dotenv').config({ path: './config.env' });

process.env.UV_THREADPOOL_SIZE = OS.cpus().length;
if (process.env.NODE_ENV === 'development')
  console.log('THREAD POOL SIZE: ', process.env.UV_THREADPOOL_SIZE);

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
