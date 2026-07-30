import { useCookies } from 'react-cookie';

// Versioned per notice: the previous incident banner wrote a 30-day dismissal
// under `down-notice-banner-dismiss`, so reusing that key would hide this notice
// from everyone who dismissed the last one.
export const DOWN_NOTICE_BANNER_DISMISS_COOKIE = 'down-notice-banner-dismiss-2026-07-31';

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
 */
export function useDownNoticeBanner(): UseDownNoticeBannerResult {
  const [cookies, setCookie] = useCookies([DOWN_NOTICE_BANNER_DISMISS_COOKIE]);
  // react-cookie (universal-cookie) JSON-parses the stored value on read, so a
  // written `'true'` comes back as the boolean `true`. Compare on truthiness.
  const visible = !cookies[DOWN_NOTICE_BANNER_DISMISS_COOKIE];

  const dismiss = () => {
    setCookie(DOWN_NOTICE_BANNER_DISMISS_COOKIE, 'true', {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return { visible, dismiss };
}
