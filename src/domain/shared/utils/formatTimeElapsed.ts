import { TFunction } from 'react-i18next';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 31 * ONE_DAY;
const ONE_YEAR = 256 * ONE_DAY;

export const formatTimeElapsed = (date: Date | string | undefined, t: TFunction<'translation', undefined>): string => {
  if (!date) {
    return '';
  }
  const currentDate = new Date();
  const formatCandidate = new Date(date);

  const diffInTime = currentDate.getTime() - formatCandidate.getTime();

  if (diffInTime > ONE_YEAR) {
    const timeDiff = Math.round(diffInTime / ONE_YEAR);
    return t('common.time.timeAgo', {
      time: t('common.time.year', { count: timeDiff }),
    });
  }
  if (diffInTime > ONE_MONTH) {
    const timeDiff = Math.round(diffInTime / ONE_MONTH);
    return t('common.time.timeAgo', {
      time: t('common.time.month', { count: timeDiff }),
    });
  }

  if (diffInTime > ONE_DAY) {
    const timeDiff = Math.round(diffInTime / ONE_DAY);
    return t('common.time.timeAgo', {
      time: t('common.time.day', { count: timeDiff }),
    });
  }

  if (diffInTime > ONE_HOUR) {
    const timeDiff = Math.round(diffInTime / ONE_HOUR);
    return t('common.time.timeAgo', {
      time: t('common.time.hour', { count: timeDiff }),
    });
  }

  if (diffInTime > ONE_MINUTE) {
    const timeDiff = Math.round(diffInTime / ONE_MINUTE);
    return t('common.time.timeAgo', {
      time: t('common.time.minute', { count: timeDiff }),
    });
  }

  const timeDiff = Math.round(diffInTime / ONE_SECOND);

  if (timeDiff === 0) {
    return 'just now';
  }

  return t('common.time.timeAgo', {
    time: t('common.time.second', { count: timeDiff }),
  });
};
