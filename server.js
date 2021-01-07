require('dotenv').config({ path: './config.env' });

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
  if (!err.message.startsWith('timeout of')) {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.message);
    server.close(() => {
      process.exit(1);
    });
  }
});
