/**
 * The deployed content-security policy with local origins and no report
 * endpoint, served report-only by the Vite dev server so developers see the
 * same violations the environments report. Vite's own dev preamble is an
 * inline module script and shows up as one expected report-only entry.
 */
export function buildDevContentSecurityPolicy({
  appOrigin,
  matrixUrl,
  identityOrigin,
}: {
  appOrigin: string;
  matrixUrl: string;
  identityOrigin: string;
}) {
  const wsOrigin = appOrigin.replace(/^http/, 'ws');
  // Kratos social login POSTs to the identity host, which redirects to the
  // provider; form-action applies to that redirect chain.
  const oidcProviders =
    'https://www.linkedin.com https://login.microsoftonline.com https://login.live.com https://github.com https://connect.acc.cleverbase.com';
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `form-action 'self' ${identityOrigin} ${oidcProviders}`,
    `script-src 'self' 'wasm-unsafe-eval' ${identityOrigin}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    // appOrigin: the API origin from innovation-hub subdomains, where 'self' is the subdomain;
    // data: for whiteboard images converted with fetch(dataUrl).
    `connect-src 'self' data: ${appOrigin} ${wsOrigin} ${identityOrigin} ${matrixUrl}`,
    "frame-src 'self' https: http://localhost:*",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');
}
