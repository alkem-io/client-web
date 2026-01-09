import type { TFunction } from 'i18next';
import dayjs from 'dayjs';

// Note: In this file some dates are recreated with
//  `new Date(something that is supposed to be already a Date)`
//  because the API is returning strings parsable as a Dates but not a real Javascript Dates, and
//  Codegen tool wrongly generates models with Date properties.

// TODO: format dates in a better way. Maybe use momentjs?
// TODO: support en-us format mm/dd?? Maybe get this from the browser?
const LocaleId = 'en-GB';

export const DAYJS_DATEFORMAT = 'DD/MM/YYYY';

export const getEndDateByDuration = (startDate: Date | string | undefined, durationMinutes: number) => {
  if (!startDate) {
    return new Date();
  }

  return new Date(new Date(startDate).getTime() + durationMinutes * 60000);
};

type BadgeDateProps = {
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  defaultValue?: string;
};

// Badge component displays start and end dates
// we're calculating the end date (if such) by durationMinutes
export const formatBadgeDate = ({
  startDate,
  durationMinutes,
  durationDays = 0,
  defaultValue = '',
}: BadgeDateProps) => {
  if (!startDate) {
    return {
      startDate: defaultValue,
      endDate: null,
    };
  }

  const startDateFormatted = new Date(startDate).toLocaleDateString(LocaleId, { day: '2-digit', month: '2-digit' });

  if (!durationDays || durationDays < 1) {
    return {
      startDate: startDateFormatted,
      endDate: null,
    };
  } else if (durationMinutes && durationMinutes > 0) {
    const endDate = getEndDateByDuration(startDate, durationMinutes);

    return {
      startDate: startDateFormatted,
      endDate: endDate.toLocaleDateString(LocaleId, { day: '2-digit', month: '2-digit' }),
    };
  }

  return {
    startDate: startDateFormatted,
    endDate: null,
  };
};

const longDayFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

// either only startDateTime
// or startDateTime - endDateTime
export const formatLongDateTimeString = ({
  startDate,
  durationMinutes,
  durationDays = 0,
  defaultValue = '',
}: BadgeDateProps) => {
  if (!startDate) {
    return defaultValue;
  }

  // note can't extract the formatting options because of type error
  let longDateTimeString = new Date(startDate).toLocaleDateString(LocaleId, longDayFormatOptions);

  if ((durationDays || 0) > 0 && durationMinutes && durationMinutes > 0) {
    const endDate = getEndDateByDuration(startDate, durationMinutes);

    longDateTimeString += ' - ' + endDate.toLocaleDateString(LocaleId, longDayFormatOptions);
  }

  return longDateTimeString;
};

export const formatDate = (date: Date | string | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString(LocaleId, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatLongDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString(LocaleId, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function addMinutes(date: Date | string, minutes: number): Date {
  return dayjs(date).add(minutes, 'minutes').toDate();
}

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

export const formatTimeAndDuration = (
  event: { startDate?: Date; durationMinutes?: number; wholeDay?: boolean; durationDays?: number },
  t: TFunction
) => {
  if (!event.startDate) return '';
  if (event.wholeDay) {
    return t('calendar.event.whole-day');
  }
  const startDate = new Date(event.startDate);

  if (!event.durationMinutes || (event.durationDays ?? 0) > 0) {
    return startDate.toLocaleTimeString(LocaleId, timeFormatOptions);
  } else {
    const endDate = addMinutes(startDate, event.durationMinutes);
    return (
      startDate.toLocaleTimeString(LocaleId, timeFormatOptions) +
      ' - ' +
      endDate.toLocaleTimeString(LocaleId, timeFormatOptions)
    );
  }
};

export const formatTime = (date: Date | undefined) => {
  if (!date) {
    return null;
  }

  return date.toLocaleTimeString(LocaleId, timeFormatOptions);
};

export const dateRounded = (date: Date = new Date()) => {
  const result = new Date(new Date(date).getTime() + 59 * 60000); // Round to the next hour
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

export const startOfDay = (date: Date = new Date()) => {
  const result = new Date(date);
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('DD/MM/YYYY[ at ]HH:mm');
};

const dayFormatOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export const isSameDay = (startDate: Date | undefined, endDate: number | Date | undefined) => {
  if (!startDate || !endDate) {
    return true;
  }

  const startDateOnly = new Date(startDate).toLocaleDateString(LocaleId, dayFormatOptions);
  const endDateOnly = new Date(endDate).toLocaleDateString(LocaleId, dayFormatOptions);

  return startDateOnly === endDateOnly;
};
