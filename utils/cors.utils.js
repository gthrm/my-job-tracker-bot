require('dotenv').config();

function corsCheck(origin, callback) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  // allow requests with no origin
  // (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  if (allowedOrigins.indexOf(origin) === -1) {
    const msg = 'The CORS policy for this site does not '
      + 'allow access from the specified Origin.';
    return callback(new Error(msg), false);
  }
  return callback(null, true);
}

module.exports = {
  corsCheck,
};
