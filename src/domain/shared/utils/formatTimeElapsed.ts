import type { TFunction } from 'i18next';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
// const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 365 * ONE_DAY;
const TWO_YEARS = 2 * ONE_YEAR;

export const formatTimeElapsed = (date: Date | string, t: TFunction, format: 'short' | 'long' = 'short'): string => {
  const currentDate = new Date();
  const formatCandidate = new Date(date);

  const diffInTime = Math.max(0, currentDate.getTime() - formatCandidate.getTime());

  if (diffInTime > TWO_YEARS) {
    return t(`common.time.${format}.timeAgo` as const, {
      time: t('common.time.moreThan1Year'),
    });
  }

  if (diffInTime > ONE_YEAR) {
    const timeDiff = Math.round(diffInTime / ONE_YEAR);
    return t(`common.time.${format}.timeAgo` as const, {
      time: t(`common.time.${format}.year` as const, { count: timeDiff }),
    });
  }

  /* Removed months at client-web#8837
  if (diffInTime > ONE_MONTH) {
    const timeDiff = Math.round(diffInTime / ONE_MONTH);
    return t(`common.time.${format}.timeAgo` as const, {
      time: t(`common.time.${format}.month` as const, { count: timeDiff }),
    });
  } */

  if (diffInTime > ONE_DAY) {
    const timeDiff = Math.round(diffInTime / ONE_DAY);
    return t(`common.time.${format}.timeAgo` as const, {
      time: t(`common.time.${format}.day` as const, { count: timeDiff }),
    });
  }

  if (diffInTime > ONE_HOUR) {
    const timeDiff = Math.round(diffInTime / ONE_HOUR);
    return t(`common.time.${format}.timeAgo` as const, {
      time: t(`common.time.${format}.hour` as const, { count: timeDiff }),
    });
  }

  if (diffInTime > ONE_MINUTE) {
    const timeDiff = Math.round(diffInTime / ONE_MINUTE);
    return t(`common.time.${format}.timeAgo` as const, {
      time: t(`common.time.${format}.minute` as const, { count: timeDiff }),
    });
  }

  const timeDiff = Math.round(diffInTime / ONE_SECOND);

  if (timeDiff === 0) {
    return 'just now';
  }

  return t(`common.time.${format}.timeAgo` as const, {
    time: t(`common.time.${format}.second` as const, { count: timeDiff }),
  });
};
