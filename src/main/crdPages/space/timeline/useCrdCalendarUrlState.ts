import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { useQueryParams } from '@/core/routing/useQueryParams';

/**
 * URL constants for the calendar dialog deeplinks (FR-036).
 *
 * MUST match the values in src/domain/timeline/calendar/CalendarDialog.tsx
 * for as long as the legacy MUI dialog is reachable behind the CRD feature
 * toggle. When the toggle is retired, both files can converge on a single
 * source.
 */
export const HIGHLIGHT_PARAM_NAME = 'highlight';
export const INIT_CREATING_EVENT_PARAM = 'new';
export const CALENDAR_PATH_SEGMENT = 'calendar';

const INTERNAL_DATE_FORMAT = 'YYYY-MM-DD';

export type CrdCalendarUrlState = {
  /** Parsed `?highlight=YYYY-MM-DD` value at start-of-day local. Null if absent or invalid. */
  highlightedDay: Date | null;
  /** True when `?new=1` is present. */
  isCreatingFromUrl: boolean;
  /** True when the URL path includes `/calendar` (list, create, or detail). */
  isAnyCalendarRoute: boolean;

  /** Push `?highlight=YYYY-MM-DD` and keep current path. */
  navigateToHighlight: (date: Date) => void;
  /** Push `?new=1` and ensure path is `/calendar` under the current space root. */
  navigateToCreate: () => void;
  /** Strip params and event id; navigate to the bare `/<space>/calendar`. */
  navigateToList: () => void;
  /**
   * Navigate to a specific event detail URL (use `event.profile.url` from the
   * GraphQL fragment — already a fully-qualified path of the form
   * `/<space>/calendar/<event-name-id>`).
   */
  navigateToEvent: (eventUrl: string) => void;
  /** Strip the entire calendar tail from the URL (path segment + params). Used on dialog close. */
  navigateAwayFromCalendar: () => void;
};

/**
 * Reads/writes the calendar dialog's URL state. The dialog itself is opened
 * by the consumer based on `isAnyCalendarRoute` || a local "open" flag; this
 * hook only owns the URL contract.
 */
export function useCrdCalendarUrlState(): CrdCalendarUrlState {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useQueryParams();

  const highlightedDayParam = params.get(HIGHLIGHT_PARAM_NAME);
  const highlightedDay =
    highlightedDayParam && dayjs(highlightedDayParam).isValid()
      ? dayjs(highlightedDayParam).startOf('day').toDate()
      : null;

  const isCreatingFromUrl = params.get(INIT_CREATING_EVENT_PARAM) === '1';
  const isAnyCalendarRoute = pathname.includes(`/${CALENDAR_PATH_SEGMENT}`);

  /**
   * Resolves the bare `/<space>/calendar` path from the current location:
   *   - If the path includes `/calendar/...`, truncate everything after `/calendar`.
   *   - If the path ends in `/calendar`, return as-is.
   *   - Otherwise, append `/calendar` to the current path.
   */
  const calendarBasePath = (() => {
    const idx = pathname.lastIndexOf(`/${CALENDAR_PATH_SEGMENT}`);
    if (idx === -1) {
      return pathname.endsWith('/') ? `${pathname}${CALENDAR_PATH_SEGMENT}` : `${pathname}/${CALENDAR_PATH_SEGMENT}`;
    }
    return pathname.substring(0, idx + `/${CALENDAR_PATH_SEGMENT}`.length);
  })();

  /** The URL one level above the calendar tail (used by navigateAwayFromCalendar). */
  const dashboardBasePath = (() => {
    const idx = pathname.lastIndexOf(`/${CALENDAR_PATH_SEGMENT}`);
    if (idx === -1) return pathname;
    return pathname.substring(0, idx) || '/';
  })();

  return {
    highlightedDay,
    isCreatingFromUrl,
    isAnyCalendarRoute,

    navigateToHighlight: (date: Date) => {
      const next = new URLSearchParams(params.toString());
      next.set(HIGHLIGHT_PARAM_NAME, dayjs(date).format(INTERNAL_DATE_FORMAT));
      next.delete(INIT_CREATING_EVENT_PARAM);
      navigate(`${calendarBasePath}?${next.toString()}`, { replace: true });
    },

    navigateToCreate: () => {
      const next = new URLSearchParams();
      next.set(INIT_CREATING_EVENT_PARAM, '1');
      navigate(`${calendarBasePath}?${next.toString()}`);
    },

    navigateToList: () => {
      navigate(calendarBasePath);
    },

    navigateToEvent: (eventUrl: string) => {
      navigate(eventUrl);
    },

    navigateAwayFromCalendar: () => {
      navigate(dashboardBasePath);
    },
  };
}
