const Airtable = require('airtable');

require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN }).base(
  process.env.BASE_ID,
);

module.exports = {
  base,
};
