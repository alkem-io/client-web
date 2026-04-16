import { format, isValid, parse, startOfDay } from 'date-fns';
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

// date-fns uses Unicode tokens — yyyy/MM/dd, NOT moment-style YYYY/DD which
// dayjs accepts. The string 'yyyy-MM-dd' is the wire format for the
// ?highlight= deeplink param.
const INTERNAL_DATE_FORMAT = 'yyyy-MM-dd';
const CALENDAR_PATH_MARKER = `/${CALENDAR_PATH_SEGMENT}`;

/**
 * Splits a pathname around the `/calendar` segment into its two anchors.
 *
 * Examples:
 *   `/spaces/foo`                          → { basePath: '/spaces/foo',     calendarPath: '/spaces/foo/calendar' }
 *   `/spaces/foo/`                         → { basePath: '/spaces/foo',     calendarPath: '/spaces/foo/calendar' }
 *   `/spaces/foo/calendar`                 → { basePath: '/spaces/foo',     calendarPath: '/spaces/foo/calendar' }
 *   `/spaces/foo/calendar/event-bar`       → { basePath: '/spaces/foo',     calendarPath: '/spaces/foo/calendar' }
 *   `/calendar/event-bar` (root-level)     → { basePath: '/',               calendarPath: '/calendar' }
 *
 * `basePath` is the dashboard URL (used to navigate away from the dialog);
 * `calendarPath` is the bare list-view URL (used to strip the event tail).
 */
function splitCalendarPath(pathname: string): { basePath: string; calendarPath: string } {
  const idx = pathname.lastIndexOf(CALENDAR_PATH_MARKER);

  if (idx === -1) {
    // No /calendar segment yet — the dashboard IS the basePath, and the
    // calendar list-view URL is one segment deeper.
    const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    return {
      basePath: pathname,
      calendarPath: `${trimmed}${CALENDAR_PATH_MARKER}`,
    };
  }

  const basePath = pathname.substring(0, idx) || '/';
  const calendarPath = pathname.substring(0, idx + CALENDAR_PATH_MARKER.length);
  return { basePath, calendarPath };
}

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
  const highlightedDay = (() => {
    if (!highlightedDayParam) return null;
    const parsed = parse(highlightedDayParam, INTERNAL_DATE_FORMAT, new Date());
    return isValid(parsed) ? startOfDay(parsed) : null;
  })();

  const isCreatingFromUrl = params.get(INIT_CREATING_EVENT_PARAM) === '1';
  const isAnyCalendarRoute = pathname.includes(CALENDAR_PATH_MARKER);

  const { basePath, calendarPath } = splitCalendarPath(pathname);

  return {
    highlightedDay,
    isCreatingFromUrl,
    isAnyCalendarRoute,

    navigateToHighlight: (date: Date) => {
      const next = new URLSearchParams(params.toString());
      next.set(HIGHLIGHT_PARAM_NAME, format(date, INTERNAL_DATE_FORMAT));
      next.delete(INIT_CREATING_EVENT_PARAM);
      navigate(`${calendarPath}?${next.toString()}`, { replace: true });
    },

    navigateToCreate: () => {
      const next = new URLSearchParams();
      next.set(INIT_CREATING_EVENT_PARAM, '1');
      navigate(`${calendarPath}?${next.toString()}`);
    },

    navigateToList: () => {
      navigate(calendarPath);
    },

    navigateToEvent: (eventUrl: string) => {
      navigate(eventUrl);
    },

    navigateAwayFromCalendar: () => {
      navigate(basePath);
    },
  };
}
