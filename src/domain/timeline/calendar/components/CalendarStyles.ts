import { gutters } from '@/core/ui/grid/utils';
import { Box, styled, Theme } from '@mui/material';

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
const CalendarStyles = styled(Box)(({ theme }) => ({
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
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-2px',
    position: 'relative',
    borderRadius: '4px',
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
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-2px',
  },
  // Today's tile
  '.react-calendar__tile--now': {
    backgroundColor: colors(theme).today.background,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  '.react-calendar__tile--now:enabled:hover, .react-calendar__tile--now:enabled:focus': {
    backgroundColor: colors(theme).today.background,
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-2px',
    position: 'relative',
    zIndex: 10,
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
  // Enhanced keyboard focus visibility
  '.react-calendar button:focus-visible': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: '-1px',
    position: 'relative',
    zIndex: 10,
  },
}));

export default CalendarStyles;
