// Identity/auth screens (mirrors IdentityRoutes in IdentityRoute.tsx).
const AUTH_ROUTE_SEGMENTS = [
  'login',
  'logout',
  'registration',
  'sign_up',
  'verify',
  'recovery',
  'required',
  'error',
  'settings',
];

/**
 * True when `pathname` is one of the identity/auth screens. Those screens own
 * the auth cookies and the session mismatches that are normal mid-flow, so
 * app-wide auth hooks must stay out of their way.
 *
 * Split on `/`, `?` and `#` so a stray query/hash can't sneak a route past us.
 */
export const isAuthRoutePathname = (pathname: string): boolean => {
  const segment = pathname.replace(/^\/+/, '').split(/[/?#]/)[0];
  return AUTH_ROUTE_SEGMENTS.includes(segment);
};
