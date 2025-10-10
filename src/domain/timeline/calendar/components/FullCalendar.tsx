import { FC, useMemo } from 'react';
import { Box, BoxProps, styled, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Identifiable } from '@/core/utils/Identifiable';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { getEndDateByDuration, startOfDay } from '@/core/utils/time/utils';
import { useTranslation } from 'react-i18next';
import CalendarStyles from './CalendarStyles';
import SkipLink from '@/core/ui/keyboardNavigation/SkipLink';
import { useNextBlockAnchor } from '@/core/ui/keyboardNavigation/NextBlockAnchor';

export const INTERNAL_DATE_FORMAT = 'YYYY-MM-DD';

interface EventsTooltipProps {
  events: FullCalendarProps['events'];
}

/**
 * Tooltip for the highlighted days with the list of events
 */
const EventsList = styled('ul')(({ theme }) => ({
  padding: 0,
  paddingLeft: gutters(1)(theme),
  paddingRight: gutters(0.5)(theme),
}));

const EventsTooltip: FC<EventsTooltipProps> = ({ events = [] }) => {
  const { t } = useTranslation();

  const getEventSummary = (event: FullCalendarProps['events'][0]) => {
    const name = event.profile.displayName;

    if (event.wholeDay) {
      return `${t('calendar.event.whole-day')} - ${name}`;
    }

    if (event.durationDays && event.durationMinutes) {
      return name;
    }

    return `${dayjs(event.startDate).format('HH:mm')} - ${name}`;
  };

  return (
    <Tooltip
      arrow
      title={
        <EventsList>
          {events.map(event => (
            <li key={event.id}>
              <Caption>{getEventSummary(event)}</Caption>
            </li>
          ))}
        </EventsList>
      }
    >
      <Box className="tooltip-anchor" />
    </Tooltip>
  );
};

export interface FullCalendarProps {
  events: {
    id: string;
    startDate?: Date;
    durationMinutes: number;
    durationDays?: number;
    wholeDay?: boolean;
    profile: {
      displayName: string;
    };
  }[];
  onClickHighlightedDate: (date: Date, events: Identifiable[]) => void;
  selectedDate?: Date | null;
  sx?: BoxProps['sx'];
}

const addEventToBucket = (
  obj: { [key: string]: FullCalendarProps['events'] } | {},
  key: string,
  val: FullCalendarProps['events'][0]
) => {
  if (!obj[key]) {
    obj[key] = [];
  }
  obj[key].push(val);
};

const FullCalendar: FC<FullCalendarProps & { ref?: React.Ref<HTMLDivElement> }> = ({
  events = [],
  onClickHighlightedDate,
  selectedDate = null,
  sx,
  ref,
}) => {
  const nextBlock = useNextBlockAnchor();

  const highlightedDates = useMemo(() => {
    // The objects look like:
    //  { "yyyy-mm-dd": [...events on this date], "yyyy-mm-dd": [...events], ...}
    const startDates: { [key: string]: FullCalendarProps['events'] } = {};
    const endDates: { [key: string]: FullCalendarProps['events'] } = {};
    const allDates: { [key: string]: FullCalendarProps['events'] } = {};

    events.forEach(event => {
      let currentDate = dayjs(event.startDate);
      const endDate = dayjs(getEndDateByDuration(event.startDate, event.durationMinutes));

      // Populate startDates
      const startFormattedDate = currentDate.format(INTERNAL_DATE_FORMAT);
      addEventToBucket(startDates, startFormattedDate, event);

      // Populate endDates
      const endFormattedDate = endDate.format(INTERNAL_DATE_FORMAT);
      addEventToBucket(endDates, endFormattedDate, event);

      // all dates (including the days between start and end)
      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        const formattedDate = currentDate.format(INTERNAL_DATE_FORMAT);
        addEventToBucket(allDates, formattedDate, event);
        currentDate = currentDate.add(1, 'day');
      }
    });

    return {
      start: startDates,
      end: endDates,
      all: allDates,
    };
  }, [events]);

  const isHighlighted = (date: Date) => {
    return Boolean(highlightedDates.all[dayjs(date).format(INTERNAL_DATE_FORMAT)]);
  };

  const isStartDate = (date: Date): boolean => {
    return Boolean(highlightedDates.start[dayjs(date).format(INTERNAL_DATE_FORMAT)]);
  };

  const isEndDate = (date: Date): boolean => {
    return Boolean(highlightedDates.end[dayjs(date).format(INTERNAL_DATE_FORMAT)]);
  };

  const today = startOfDay();

  const isPastDate = (date: Date) => {
    return dayjs(date).isBefore(today);
  };

  const handleClickDay = (date: Date) => {
    if (onClickHighlightedDate) {
      const events = highlightedDates.start[dayjs(date).format(INTERNAL_DATE_FORMAT)] || [];
      if (events.length > 0) {
        onClickHighlightedDate(date, events);
      }
    }
  };

  const getClassName = (date: Date) => {
    let highlightClassNames = '';

    if (isHighlighted(date)) {
      highlightClassNames += ' highlight';
    }

    if (isStartDate(date)) {
      highlightClassNames += ' highlight-start';
    }

    if (isEndDate(date)) {
      highlightClassNames += ' highlight-end';
    }

    return `${highlightClassNames} ${isPastDate(date) ? 'past-date' : ''}`;
  };

  return (
    <CalendarStyles sx={{ ...sx, position: 'relative' }} ref={ref}>
      <SkipLink anchor={nextBlock} sx={{ position: 'absolute', right: 0, top: 0, zIndex: 99999 }} />

      <Calendar
        tileClassName={({ date }) => getClassName(date)}
        tileContent={({ date }) => {
          if (isHighlighted(date)) {
            const events = highlightedDates.all[dayjs(date).format(INTERNAL_DATE_FORMAT)] || [];
            return <EventsTooltip events={events} />;
          }
          return null;
        }}
        onClickDay={handleClickDay}
        selectRange={false}
        value={selectedDate}
      />
    </CalendarStyles>
  );
};

export default FullCalendar;
