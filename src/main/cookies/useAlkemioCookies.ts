import { useEffect } from 'react';
import { useCookies } from 'react-cookie';

export const ALKEMIO_COOKIE_NAME = 'accepted_cookies';
// localStorage marker so the host-only -> apex consent migration runs at most once per
// browser, rather than re-writing the cookie (and sliding its 150-day expiry) on every load.
const CONSENT_APEX_MIGRATED_KEY = 'alkemio.consentCookieApexMigrated';
export const AlkemioCookieTypes = {
  technical: 'technical',
  analysis: 'analysis',
};
const MANDATORY_COOKIES = [AlkemioCookieTypes.technical];
const ALL_COOKIES = [...Object.values(AlkemioCookieTypes)];

// Environment apex domain (e.g. `.alkem.io`, `.acc-alkem.io`, `.dev-alkem.io`) so the
// consent cookie is shared across `*.alkem.io` — the welcome site (welcome.alkem.io)
// writes it at this same apex, so scoping it here lets a consent given on the platform
// (app.alkem.io) be read on welcome, matching the already-working reverse direction.
// Returns undefined for localhost / IP / single-label hosts: a `domain` attribute would
// be rejected there and silently break consent in local dev. Same derivation as the
// cross-subdomain returnUrl cookie in core/auth (useSignUpReturnUrl.ts).
const apexCookieDomain = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return undefined;
  }

  const parts = hostname.split('.');
  return parts.length >= 2 ? `.${parts.slice(-2).join('.')}` : undefined;
};

const createCookieOptions = () => {
  const date = new Date();
  date.setDate(date.getDate() + 150);
  return { expires: date, path: '/', domain: apexCookieDomain() };
};

// One-time migration for #9695. Users who accepted before the apex-domain fix hold a
// host-only `accepted_cookies` on the platform host, so welcome.alkem.io still can't read
// it — and because the banner only shows while consent is absent (App.tsx), they never
// re-trigger a write to self-heal. On first load after the fix, re-persist that consent at
// the apex and drop the host-only duplicate so it can no longer shadow the apex cookie.
// No-op on localhost/IP (no shared parent domain) and once the migration has already run.
export const useMigrateConsentCookieToApex = () => {
  const [cookies, setCookie, removeCookie] = useCookies([ALKEMIO_COOKIE_NAME]);
  const consent = cookies[ALKEMIO_COOKIE_NAME];

  useEffect(() => {
    if (consent === undefined || consent === null) return;
    if (apexCookieDomain() === undefined) return;
    if (window.localStorage.getItem(CONSENT_APEX_MIGRATED_KEY)) return;

    // Delete the host-only copy (no domain) first, then re-write the same value at the apex.
    removeCookie(ALKEMIO_COOKIE_NAME, { path: '/' });
    setCookie(ALKEMIO_COOKIE_NAME, consent, createCookieOptions());
    window.localStorage.setItem(CONSENT_APEX_MIGRATED_KEY, '1');
  }, [consent, removeCookie, setCookie]);
};

export const useAlkemioCookies = () => {
  const [, setCookie] = useCookies([ALKEMIO_COOKIE_NAME]);

  const acceptAllCookies = () => {
    const options = createCookieOptions();
    setCookie(ALKEMIO_COOKIE_NAME, JSON.stringify(ALL_COOKIES), options);
  };

  const acceptOnlySelected = (selectedCookies: string[]) => {
    const cookies = new Set([...MANDATORY_COOKIES, ...selectedCookies]);
    const options = createCookieOptions();
    setCookie(ALKEMIO_COOKIE_NAME, JSON.stringify([...cookies]), options);
  };

  return { acceptAllCookies, acceptOnlySelected };
};
