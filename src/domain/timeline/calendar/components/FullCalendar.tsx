import { FC, useMemo } from 'react';
import { Box, BoxProps, styled, Theme, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarEvent, CalendarEventDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import { groupBy } from 'lodash';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { startOfDay } from '../../../../core/utils/time/utils';

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
    background: theme.palette.neutral.light,
    font: theme.palette.neutralLight.contrastText,
  },
  today: {
    background: 'transparent',
    font: theme.palette.primary.dark,
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
    color: colors(theme).today.font,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  '.react-calendar__tile--now:enabled:hover, & .react-calendar__tile--now:enabled:focus': {
    backgroundColor: colors(theme).today.background,
    color: colors(theme).today.font,
  },
  // Disabled tiles
  '.react-calendar__tile:disabled': {
    backgroundColor: colors(theme).disabled.background,
    color: colors(theme).disabled.font,
  },
  // Highlighted tiles
  '.highlight': {
    backgroundColor: 'transparent',
    color: colors(theme).highlight.font,
  },
  '.highlight.past-date': {
    color: colors(theme).highlightPastDate.font,
  },
  // Circle centered in the middle of the tile of the higlighted days:
  '.highlight::before': {
    content: '""',
    position: 'absolute',
    width: '50%',
    maxHeight: '100%',
    maxWidth: gutters(1.5)(theme),
    aspectRatio: '1/1',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    borderRadius: '50%',
    zIndex: 1,
    backgroundColor: colors(theme).highlight.background,
    color: colors(theme).highlight.font,
  },
  '.highlight.past-date::before': {
    backgroundColor: colors(theme).highlightPastDate.background,
    color: colors(theme).highlightPastDate.font,
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
  marginY: gutters(0.5)(theme),
  marginX: 0,
  padding: 0,
  paddingLeft: gutters(1)(theme),
  listStyle: 'circle',
}));
const EventsTooltip: FC<EventsTooltipProps> = ({ events = [] }) => (
  <Tooltip
    arrow
    title={
      <EventsList>
        {events.map(event => (
          <li key={event.nameID}>
            <Caption>{event.profile.displayName}</Caption>
          </li>
        ))}
      </EventsList>
    }
  >
    <Box className="tooltip-anchor" />
  </Tooltip>
);

const INTERNAL_DATE_FORMAT = 'YYYY-MM-DD';
export interface FullCalendarProps {
  events: Pick<CalendarEventDetailsFragment, 'nameID' | 'startDate' | 'profile'>[];
  onClickEvents?: (events: Pick<CalendarEvent, 'nameID'>[]) => void;
  sx?: BoxProps['sx'];
}

const FullCalendar: FC<FullCalendarProps> = ({ events = [], onClickEvents, sx }) => {
  const highlightedDates = useMemo(() => {
    // This object will look like:
    //  { "yyyy-mm-dd": [...events on this date], "yyyy-mm-dd": [...events], ...}
    return groupBy(events, event => dayjs(event.startDate).format(INTERNAL_DATE_FORMAT));
  }, [events]);

  const isHighlighted = (date: Date) => {
    return Boolean(highlightedDates[dayjs(date).format(INTERNAL_DATE_FORMAT)]);
  };

  const today = startOfDay();

  const isPastDate = (date: Date) => {
    return dayjs(date).isBefore(today);
  };

  const handleClickDay = (date: Date) => {
    if (onClickEvents) {
      const events = highlightedDates[dayjs(date).format(INTERNAL_DATE_FORMAT)] || [];
      if (events.length > 0) {
        onClickEvents(events);
      }
    }
  };

  return (
    <Root sx={sx}>
      <Calendar
        tileClassName={({ date }) => `${isHighlighted(date) ? 'highlight' : ''} ${isPastDate(date) ? 'past-date' : ''}`}
        tileContent={({ date }) => {
          if (isHighlighted(date)) {
            const events = highlightedDates[dayjs(date).format(INTERNAL_DATE_FORMAT)] || [];
            return <EventsTooltip events={events} />;
          }
          return null;
        }}
        onClickDay={handleClickDay}
        selectRange={false}
        value={null}
      />
    </Root>
  );
};

export default FullCalendar;
