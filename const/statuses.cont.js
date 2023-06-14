const statusesObj = {
  CV_SENT: 'CV Sent',
  HR_INTERVIEW: 'HR Interview',
  TECH_INTERVIEW: 'Technical Interview',
  OFFER_RECEIVED: 'Offer Received',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
};
const statuses = Object.values(statusesObj);
module.exports = { statuses, statusesObj };
