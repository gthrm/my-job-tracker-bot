const statusesObj = {
  CV_SENT: 'CV Sent',
  HR_INTERVIEW: 'HR Interview',
  TECH_INTERVIEW: 'Technical Interview',
  ACCEPTED: 'Accepted',
  OFFER_RECEIVED: 'Offer Received',
  ON_HOLD: 'On Hold',
  REJECTED: 'Rejected',
};
const userStatuses = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
};
const statuses = Object.values(statusesObj);

module.exports = { statuses, statusesObj, userStatuses };
