import { TFunction } from 'react-i18next';
import { CalendarEvent } from '../../core/apollo/generated/graphql-schema';
// TODO: format dates in a better way. Maybe use momentjs?

// TODO: support en-us format mm/dd?? Maybe get this from the browser?
const LocaleId = 'en-GB';

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

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

type NeededFields = 'startDate' | 'durationMinutes' | 'wholeDay';
export const formatTimeAndDuration = (
  event: Pick<CalendarEvent, NeededFields>,
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
