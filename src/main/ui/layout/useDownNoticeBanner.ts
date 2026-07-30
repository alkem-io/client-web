import { useCookies } from 'react-cookie';

// Versioned per notice: the previous incident banner wrote a 30-day dismissal
// under `down-notice-banner-dismiss`, so reusing that key would hide this notice
// from everyone who dismissed the last one.
export const DOWN_NOTICE_BANNER_DISMISS_COOKIE = 'down-notice-banner-dismiss-2026-07-31';

/**
 * Midnight on 1 August, CEST — the zone the notice itself quotes. The banner
 * announces a single dated window, so it hard-expires here instead of relying
 * on every user dismissing it: once it is 1 August in CEST, nobody sees it.
 */
export const DOWN_NOTICE_BANNER_END = Date.parse('2026-07-31T22:00:00Z');

/** Exported for tests — `now` is epoch ms. */
export function isDownNoticeExpired(now: number): boolean {
  return now >= DOWN_NOTICE_BANNER_END;
}

type UseDownNoticeBannerResult = {
  /** Whether the maintenance banner should currently be shown. */
  visible: boolean;
  /** Dismiss the banner and persist the choice in a cookie. */
  dismiss: () => void;
};

/**
 * Shared state for the site-wide planned-maintenance notice. The banner is
 * rendered once (by `CrdLayoutWrapper`); page layouts also read `visible` to
 * suppress the decorative hero overlay so the hero doesn't slide up over the
 * notice.
 *
 * The expiry is evaluated per render rather than on a timer — a session left
 * open across the cut-over keeps the banner until its next navigation or
 * reload, which is fine for a one-off notice.
 */
export function useDownNoticeBanner(): UseDownNoticeBannerResult {
  const [cookies, setCookie] = useCookies([DOWN_NOTICE_BANNER_DISMISS_COOKIE]);
  // react-cookie (universal-cookie) JSON-parses the stored value on read, so a
  // written `'true'` comes back as the boolean `true`. Compare on truthiness.
  const visible = !isDownNoticeExpired(Date.now()) && !cookies[DOWN_NOTICE_BANNER_DISMISS_COOKIE];

  const dismiss = () => {
    setCookie(DOWN_NOTICE_BANNER_DISMISS_COOKIE, 'true', {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return { visible, dismiss };
}
