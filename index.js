const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { bot } = require('./utils/bot.utils');
const { corsCheck } = require('./utils/cors.utils');
const { logger } = require('./utils/logger.utils');

require('dotenv').config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 429,
      message: 'Too many requests from your IP. Please wait 15 Minutes',
    },
  },
});

const app = express();

const corsOptions = {
  origin: corsCheck,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://*'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(limiter);
app.use(helmet(helmetConfig));
app.use('/', express.static(path.join(__dirname, './public')));

http.createServer(app).listen(process.env.SERVER_PORT, () => {
  logger.info(
    `Express server listening on port ${process.env.SERVER_PORT}. chrome://inspect`,
  );
  try {
    bot.launch();
  } catch (error) {
    logger.error(new Error(error));
  }
});
