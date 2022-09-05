const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_MONTH = 31 * ONE_DAY;
const ONE_YEAR = 256 * ONE_DAY;

export const formatCommentDate = (commentDate: Date): string => {
  const currentDate = new Date();

  const diffInTime = currentDate.getTime() - commentDate.getTime();

  if (diffInTime > ONE_YEAR) {
    const yearsDiff = Math.round(diffInTime / ONE_YEAR);
    return `${yearsDiff} month${yearsDiff === 1 ? '' : 's'} ago`;
  }
  if (diffInTime > ONE_MONTH) {
    const montsDiff = Math.round(diffInTime / ONE_MONTH);
    return `${montsDiff} month${montsDiff === 1 ? '' : 's'} ago`;
  }

  const dayssDiff = Math.round(diffInTime / ONE_DAY);
  return `${dayssDiff} day${dayssDiff === 1 ? '' : 's'} ago`;
};
