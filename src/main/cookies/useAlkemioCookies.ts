import { useEffect } from 'react';
import { Cookies, useCookies } from 'react-cookie';

export const ALKEMIO_COOKIE_NAME = 'accepted_cookies';
// The persistent APM tracking id, minted only with analysis consent and removed when it is withdrawn.
export const APM_COOKIE_NAME = 'apm';
// localStorage marker so the host-only -> apex consent migration runs at most once per
// browser, rather than re-writing the cookie (and sliding its 150-day expiry) on every load.
const CONSENT_APEX_MIGRATED_KEY = 'alkemio.consentCookieApexMigrated';
// localStorage marker so the clean-up of pre-existing `apm` cookies runs at most once per browser.
const APM_COOKIE_CLEANED_KEY = 'alkemio.apmCookieCleaned';
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

/** Options for the `apm` tracking id: it lives at most 13 months from when it is written. */
export const apmCookieOptions = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 13);
  return { expires: date, path: '/', sameSite: 'strict' as const };
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

type CookieConsent = { decided: boolean; analysis: boolean };

// react-cookie updates its in-memory copy even when the browser refuses the write (cookies
// blocked, domain rejected), so only `document.cookie` proves the choice was kept. This makes
// the hook re-read `document.cookie` on every change, so a refused write never shows as a
// choice (and never closes the banner).
const READ_FROM_BROWSER = { doNotUpdate: false };

const isStoredInBrowser = (value: string) =>
  document.cookie.split('; ').includes(`${ALKEMIO_COOKIE_NAME}=${encodeURIComponent(value)}`);

// A missing or malformed value (anything but an array) is no choice, so no consent.
const toConsent = (stored: unknown): CookieConsent =>
  Array.isArray(stored)
    ? { decided: true, analysis: stored.includes(AlkemioCookieTypes.analysis) }
    : { decided: false, analysis: false };

/** Reads `document.cookie` on every call, for code outside React (Sentry's hooks). */
export const hasAnalysisConsent = (): boolean => toConsent(new Cookies().get(ALKEMIO_COOKIE_NAME)).analysis;

export const useAlkemioCookies = () => {
  const [cookies, setCookie, removeCookie] = useCookies([ALKEMIO_COOKIE_NAME, APM_COOKIE_NAME], READ_FROM_BROWSER);
  const consent = toConsent(cookies[ALKEMIO_COOKIE_NAME]);

  /** Stores the choice; returns false when the browser did not keep it. */
  const saveConsent = (analysis: boolean): boolean => {
    const value = JSON.stringify(analysis ? ALL_COOKIES : MANDATORY_COOKIES);
    setCookie(ALKEMIO_COOKIE_NAME, value, createCookieOptions());
    if (!analysis) removeCookie(APM_COOKIE_NAME, { path: '/' });
    return isStoredInBrowser(value);
  };

  return { consent, saveConsent };
};

// `apm` cookies written before the consent gate may outlive a missing consent and expire in
// 2038. Once per browser, whether or not RUM is enabled: remove the cookie without analysis
// consent, and rewrite the same id with the 13-month expiry with it.
export const useCleanUpApmCookie = () => {
  const [cookies, setCookie, removeCookie] = useCookies([ALKEMIO_COOKIE_NAME, APM_COOKIE_NAME]);
  const apmId: string | undefined = cookies[APM_COOKIE_NAME];
  const { analysis } = toConsent(cookies[ALKEMIO_COOKIE_NAME]);

  useEffect(() => {
    if (!apmId) return;
    // Browsers that block site data throw on any localStorage access; the clean-up then runs on
    // every load, which only rewrites the same cookie.
    try {
      if (window.localStorage.getItem(APM_COOKIE_CLEANED_KEY)) return;
    } catch {}

    if (analysis) setCookie(APM_COOKIE_NAME, apmId, apmCookieOptions());
    else removeCookie(APM_COOKIE_NAME, { path: '/' });
    try {
      window.localStorage.setItem(APM_COOKIE_CLEANED_KEY, '1');
    } catch {}
  }, [apmId, analysis, setCookie, removeCookie]);
};
