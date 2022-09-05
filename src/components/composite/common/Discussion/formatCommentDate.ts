const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 31 * ONE_DAY;
const ONE_YEAR = 256 * ONE_DAY;

export const formatCommentDate = (commentDate: Date): string => {
  const currentDate = new Date();

  const diffInTime = currentDate.getTime() - commentDate.getTime();

  if (diffInTime > ONE_YEAR) {
    const timeDiff = Math.round(diffInTime / ONE_YEAR);
    return `${timeDiff} month${timeDiff === 1 ? '' : 's'} ago`;
  }
  if (diffInTime > ONE_MONTH) {
    const timeDiff = Math.round(diffInTime / ONE_MONTH);
    return `${timeDiff} month${timeDiff === 1 ? '' : 's'} ago`;
  }

  if (diffInTime > ONE_DAY) {
    const timeDiff = Math.round(diffInTime / ONE_DAY);
    return `${timeDiff} day${timeDiff === 1 ? '' : 's'} ago`;
  }

  if (diffInTime > ONE_HOUR) {
    const timeDiff = Math.round(diffInTime / ONE_HOUR);
    return `${timeDiff} hour${timeDiff === 1 ? '' : 's'} ago`;
  }

  if (diffInTime > ONE_MINUTE) {
    const timeDiff = Math.round(diffInTime / ONE_MINUTE);
    return `${timeDiff} minute${timeDiff === 1 ? '' : 's'} ago`;
  }

  const timeDiff = Math.round(diffInTime / ONE_SECOND);
  return `${timeDiff} second${timeDiff === 1 ? '' : 's'} ago`;
};
