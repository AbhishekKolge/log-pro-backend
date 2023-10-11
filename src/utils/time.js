const currentTime = () => {
  return new Date();
};

const checkTimeExpired = (timeArg) => {
  const minute = 60000;
  return new Date(timeArg).getTime() - minute < Date.now();
};

const time = (timeArg) => {
  return new Date(timeArg);
};

const isWeekRange = (date1, date2) => {
  const hoursDifference = Math.abs((date1 - date2) / (60 * 60 * 1000 * 7));
  return hoursDifference <= 24;
};

const isDayRange = (date1, date2) => {
  const hoursDifference = Math.abs((date1 - date2) / (60 * 60 * 1000));
  return hoursDifference <= 24;
};

module.exports = {
  currentTime,
  checkTimeExpired,
  time,
  isWeekRange,
  isDayRange,
};
