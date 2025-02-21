import { FC, useMemo } from 'react';
import { Box, BoxProps, styled, Theme, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Identifiable } from '@/core/utils/Identifiable';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { getEndDateByDuration, startOfDay } from '@/core/utils/time/utils';
import { useTranslation } from 'react-i18next';

export const INTERNAL_DATE_FORMAT = 'YYYY-MM-DD';

// Calendar colors:
// TODO: Maybe move this into the template
const colors = (theme: Theme) => ({
  background: 'transparent',
  navigation: theme.palette.common.black,
  weekdays: theme.palette.common.black,
  weekends: theme.palette.common.black,
  neighboringMonth: theme.palette.grey[300],
  highlight: {
    background: theme.palette.primary.main,
    font: theme.palette.primary.contrastText,
  },
  highlightPastDate: {
    background: theme.palette.divider,
    font: theme.palette.neutral.light,
  },
  today: {
    background: 'transparent',
  },
  selected: {
    background: theme.palette.primary.main,
    font: theme.palette.common.white,
  },
  disabled: {
    background: theme.palette.grey[100],
    font: theme.palette.grey[400],
  },
});

// Override some react-calendar styles:
const Root = styled(Box)(({ theme }) => ({
  '.react-calendar': {
    width: 'auto',
    background: colors(theme).background,
    border: 'none',
    lineHeight: 'auto',
  },
  '.react-calendar *': {
    fontFamily: theme.typography.caption.fontFamily,
  },
  '.react-calendar button:enabled:hover': {
    cursor: 'default',
  },
  '.react-calendar button.highlight:enabled:hover': {
    cursor: 'pointer',
  },
  '.react-calendar__navigation': {
    height: gutters(2)(theme),
    marginBottom: 0,
  },
  '.react-calendar__navigation button:enabled:hover, & .react-calendar__navigation button:enabled:focus': {
    cursor: 'pointer',
    background: 'transparent',
  },
  '.react-calendar__month-view__weekdays': {
    textTransform: 'capitalize',
    fontWeight: 'normal',
  },
  '.react-calendar__month-view__weekdays__weekday': {
    padding: 0,
  },
  '.react-calendar__month-view__weekdays__weekday > abbr[title]': {
    textDecoration: 'none',
  },
  '.react-calendar__month-view__days__day--weekend': {
    color: colors(theme).weekends,
  },
  '.react-calendar__month-view__days__day--neighboringMonth': {
    color: colors(theme).neighboringMonth,
  },
  '.react-calendar__tile': {
    height: gutters(1.5)(theme),
    marginBottom: 1,
    padding: 0,
    position: 'relative',
  },
  '.react-calendar__tile abbr': {
    position: 'relative',
    zIndex: 2,
  },
  '.react-calendar__year-view .react-calendar__tile, & .react-calendar__decade-view .react-calendar__tile, & .react-calendar__century-view .react-calendar__tile':
    {
      padding: 0,
      lineHeight: gutters(2)(theme),
    },
  '.react-calendar__tile:enabled:hover, & .react-calendar__tile:enabled:focus': {
    backgroundColor: colors(theme).background,
  },
  // Today's tile
  '.react-calendar__tile--now': {
    backgroundColor: colors(theme).today.background,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  '.react-calendar__tile--now:enabled:hover, .react-calendar__tile--now:enabled:focus': {
    backgroundColor: colors(theme).today.background,
  },
  // Selected date
  '.react-calendar__tile.react-calendar__tile--active': {
    color: colors(theme).selected.font,
  },
  '.react-calendar__tile.react-calendar__tile--active::before': {
    backgroundColor: colors(theme).selected.background,
    color: colors(theme).selected.font,
  },
  // Disabled tiles
  '.react-calendar__tile:disabled': {
    backgroundColor: colors(theme).disabled.background,
    color: colors(theme).disabled.font,
  },
  // Past dates:
  '.highlight.past-date': {
    color: colors(theme).highlightPastDate.font,
  },
  '.highlight.past-date::before': {
    backgroundColor: colors(theme).highlightPastDate.background,
  },
  // Past dates selected:
  '.react-calendar__tile.react-calendar__tile--active.past-date': {
    color: colors(theme).selected.font,
  },
  '.react-calendar__tile.react-calendar__tile--active.past-date::before': {
    backgroundColor: colors(theme).selected.background,
  },
  // Highlighted tiles
  '.highlight': {
    backgroundColor: 'transparent',
    color: colors(theme).highlight.font,
  },
  // Circle centered in the middle of the tile of the higlighted days:
  '.highlight::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    maxHeight: '80%',
    aspectRatio: '1/1',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    borderRadius: '0',
    zIndex: 1,
    backgroundColor: colors(theme).highlight.background,
    color: colors(theme).highlight.font,
  },
  '.highlight-start::before': {
    width: '100%',
    maxHeight: '80%',
    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
  },
  '.highlight-end::before': {
    width: '100%',
    maxHeight: '80%',
    borderTopRightRadius: '10px',
    borderBottomRightRadius: '10px',
  },
  // Transparent box over the tiles that have a Tooltip
  '.tooltip-anchor': {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 3,
  },
}));

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

const FullCalendar: FC<FullCalendarProps> = ({ events = [], onClickHighlightedDate, selectedDate = null, sx }) => {
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
    <Root sx={sx}>
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
    </Root>
  );
};

export default FullCalendar;
