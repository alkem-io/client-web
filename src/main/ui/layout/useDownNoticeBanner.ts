import { useSyncExternalStore } from 'react';
import { env } from '@/main/env';

export const DOWN_NOTICE_DISMISSED_KEY = 'alkemio_down_notice_dismissed';

/** A planned maintenance is announced from this long before it starts. */
const MAINTENANCE_LEAD_TIME_MS = 48 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

type StatuspageEvent = {
  id: string;
  name: string;
  status: string;
  shortlink?: string;
  scheduled_for?: string;
};

/** The part of Statuspage's `summary.json` the notice reads. */
export type StatuspageSummary = {
  page?: { url?: string };
  /** Unresolved incidents only. */
  incidents?: StatuspageEvent[];
  /** Upcoming and running maintenances only. */
  scheduled_maintenances?: StatuspageEvent[];
};

export type DownNotice = {
  /** Identifies what was dismissed: a status change brings the notice back. */
  key: string;
  kind: 'incident' | 'maintenanceScheduled' | 'maintenanceInProgress';
  /** The title as typed into Statuspage. Not translated. */
  name: string;
  href?: string;
  scheduledFor?: Date;
};

/** An incident wins over a maintenance. Exported for tests — `now` is epoch ms. */
export function pickDownNotice(summary: StatuspageSummary | undefined, now: number): DownNotice | undefined {
  const toNotice = (event: StatuspageEvent, kind: DownNotice['kind']): DownNotice => ({
    key: `${event.id}:${event.status}`,
    kind,
    name: event.name,
    // Built from the page's current address: a `shortlink` keeps pointing at the
    // address the page had when the event was created, and breaks if it is renamed.
    href: summary?.page?.url ? `${summary.page.url}/incidents/${event.id}` : event.shortlink,
    scheduledFor: event.scheduled_for ? new Date(event.scheduled_for) : undefined,
  });

  const incident = summary?.incidents?.[0];
  if (incident) return toNotice(incident, 'incident');

  for (const maintenance of summary?.scheduled_maintenances ?? []) {
    const startsAt = Date.parse(maintenance.scheduled_for ?? '');
    // The status is set by hand on Statuspage and may run ahead of the window (an
    // update posted as "verifying" days before): only `in_progress` says it started early.
    if (maintenance.status === 'in_progress' || !(startsAt > now)) {
      return toNotice(maintenance, 'maintenanceInProgress');
    }
    if (startsAt - now <= MAINTENANCE_LEAD_TIME_MS) return toNotice(maintenance, 'maintenanceScheduled');
  }
  return undefined;
}

// One fetch for the whole app: the layout renders the notice, and page layouts
// read `visible` to keep the hero overlay from sliding over it.
type Snapshot = { summary?: StatuspageSummary; dismissedKey: string | null };

// The layout renders this hook on every page: storage a browser refuses must not take the page down.
const readDismissed = (): string | null => {
  try {
    return localStorage.getItem(DOWN_NOTICE_DISMISSED_KEY);
  } catch {
    return null;
  }
};

let snapshot: Snapshot = { dismissedKey: readDismissed() };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

const publish = (next: Partial<Snapshot>) => {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
};

const refresh = async (apiUrl: string) => {
  if (document.visibilityState === 'hidden') return;
  try {
    const response = await fetch(`${apiUrl}/summary.json`, { headers: { Accept: 'application/json' } });
    if (response.ok) publish({ summary: await response.json() });
  } catch {
    // Statuspage unreachable: keep what we had. A status notice never becomes an error itself.
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const apiUrl = env?.VITE_APP_STATUSPAGE_API_URL;
  if (apiUrl && !timer) {
    void refresh(apiUrl);
    timer = setInterval(() => void refresh(apiUrl), REFRESH_INTERVAL_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};

const getSnapshot = () => snapshot;

type UseDownNoticeBannerResult = {
  /** Whether a notice should currently be shown. */
  visible: boolean;
  notice: DownNotice | undefined;
  /** Dismiss the current notice and remember it in this browser. */
  dismiss: () => void;
};

/**
 * Site-wide notice for an ongoing incident or a planned maintenance, read from
 * the public Statuspage API named by `VITE_APP_STATUSPAGE_API_URL` (unset = no
 * notice). The banner is rendered once (by `CrdLayoutWrapper`); page layouts
 * also read `visible` to suppress the decorative hero overlay so the hero
 * doesn't slide up over the notice.
 */
export function useDownNoticeBanner(): UseDownNoticeBannerResult {
  const { summary, dismissedKey } = useSyncExternalStore(subscribe, getSnapshot);
  const notice = pickDownNotice(summary, Date.now());
  const visible = notice !== undefined && notice.key !== dismissedKey;

  const dismiss = () => {
    if (!notice) return;
    try {
      localStorage.setItem(DOWN_NOTICE_DISMISSED_KEY, notice.key);
    } catch {
      // Dismissed for this page's life only.
    }
    publish({ dismissedKey: notice.key });
  };

  return { visible, notice, dismiss };
}
