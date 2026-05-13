const { NEAR_EXPIRY_DAYS } = require('../constants/batch.constant');

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const diffInDays = (dateA, dateB) => {
  const timeDiff = dateA.getTime() - dateB.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const isExpired = (tanggalKedaluwarsa) => {
  const targetDate = new Date(tanggalKedaluwarsa);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate.getTime() < getToday().getTime();
};

const isNearExpiry = (tanggalKedaluwarsa, thresholdDays = NEAR_EXPIRY_DAYS) => {
  if (isExpired(tanggalKedaluwarsa)) return false;
  
  const targetDate = new Date(tanggalKedaluwarsa);
  targetDate.setHours(0, 0, 0, 0);
  
  const daysDiff = diffInDays(targetDate, getToday());
  return daysDiff <= thresholdDays && daysDiff >= 0;
};

module.exports = { getToday, diffInDays, isExpired, isNearExpiry };
