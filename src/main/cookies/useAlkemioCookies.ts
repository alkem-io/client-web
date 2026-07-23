import { useCookies } from 'react-cookie';

export const ALKEMIO_COOKIE_NAME = 'accepted_cookies';
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
