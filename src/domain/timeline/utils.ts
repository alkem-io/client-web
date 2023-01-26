// TODO: format dates in a better way.

import { CalendarEvent } from '../../core/apollo/generated/graphql-schema';

// support en-us format mm/dd??
export const formatBadgeDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
};

export const formatTooltipDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', {
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
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// TODO: Maybe use momentjs?
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
type NeededFields = 'startDate' | 'durationMinutes' | 'durationDays' | 'wholeDay' | 'multipleDays';
export const formatTimeAndDuration = (event: Pick<CalendarEvent, NeededFields>) => {
  if (!event.startDate) return '';
  const startDate = new Date(event.startDate);
  if (!event.durationMinutes) {
    return startDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    const endDate = addMinutes(startDate, event.durationMinutes);
    return (
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) +
      ' - ' +
      endDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }
};
