const { format } = require('date-fns');

function getPrettyDate(date) {
  if (!date) {
    return '-';
  }
  return format(new Date(date), 'dd MMMM, yyyy, EEEE, HH:mm');
}

module.exports = { getPrettyDate };
