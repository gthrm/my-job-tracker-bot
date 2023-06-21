const express = require('express');
const http = require('http');
const { bot } = require('./utils/bot.utils');
const { logger } = require('./utils/logger.utils');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

http.createServer(app).listen(process.env.SERVER_PORT, () => {
  logger.info(
    `Express server listening on port ${process.env.SERVER_PORT}. chrome://inspect`,
  );
  try {
    bot.launch();
    logger.info('Bot launched');
  } catch (error) {
    logger.error(new Error(error));
    bot.telegram.sendMessage(
      process.env.CHANNEL_ID,
      `An exception occurred: ${error.message}`,
    );
    bot.stop();
  }
});
