import { TFunction } from 'react-i18next';
import dayjs from 'dayjs';

// Note: In this file some dates are recreated with
//  `new Date(something that is supposed to be already a Date)`
//  because the API is returning strings parseable as a Dates but not a real Javascript Dates, and
//  Codegen tool wrongly generates models with Date properties.

// TODO: format dates in a better way. Maybe use momentjs?
// TODO: support en-us format mm/dd?? Maybe get this from the browser?
const LocaleId = 'en-GB';

export const DAYJS_DATEFORMAT = 'DD/MM/YYYY';

export const formatBadgeDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString(LocaleId, { day: '2-digit', month: '2-digit' });
};

export const formatTooltipDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString(LocaleId, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatLongDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString(LocaleId, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function addMinutes(date: Date | string, minutes: number): Date {
  return dayjs(date).add(minutes, 'minutes').toDate();
}

export const formatTimeAndDuration = (
  event: { startDate?: Date; durationMinutes?: number; wholeDay?: boolean },
  t: TFunction<'translation', undefined>
) => {
  if (!event.startDate) return '';
  if (event.wholeDay) {
    return t('calendar.event.whole-day');
  }
  const startDate = new Date(event.startDate);
  if (!event.durationMinutes) {
    return startDate.toLocaleTimeString(LocaleId, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    const endDate = addMinutes(startDate, event.durationMinutes);
    return (
      startDate.toLocaleTimeString(LocaleId, {
        hour: '2-digit',
        minute: '2-digit',
      }) +
      ' - ' +
      endDate.toLocaleTimeString(LocaleId, {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }
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

export const formatDateTime = (date: Date) => {
  return dayjs(date).format('DD/MM/YYYY[ at ]HH:mm');
};

export const isSameDay = (startDate: Date | undefined, endDate: number | Date | undefined) => {
  if (!startDate || !endDate) {
    return true;
  }

  const startDateOnly = new Date(startDate);
  const endDateOnly = new Date(endDate);

  return (
    startDateOnly.getFullYear() === endDateOnly.getFullYear() &&
    startDateOnly.getMonth() === endDateOnly.getMonth() &&
    startDateOnly.getDate() === endDateOnly.getDate()
  );
};
