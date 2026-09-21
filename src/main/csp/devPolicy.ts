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
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `form-action 'self' ${identityOrigin}`,
    `script-src 'self' 'wasm-unsafe-eval' ${identityOrigin}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    `connect-src 'self' ${wsOrigin} ${identityOrigin} ${matrixUrl}`,
    "frame-src 'self' https: http://localhost:*",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');
}
