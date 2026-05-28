/**
 * Canonical URL helpers for Innovation Hubs.
 *
 * All app-generated links to a hub use the path-based `/hub/<slug>` form — never
 * the legacy `/innovation-hub/<slug>` URLs the server returns via `profile.url`,
 * and never the dev-only `?subdomain=<slug>` query-param shape produced by
 * `buildInnovationHubUrl` in `urlBuilders.ts`.
 *
 * On production, the public "view hub" affordance optionally upgrades to the
 * actual subdomain URL (`https://<slug>.<domain>`) so the URL bar reflects the
 * brand the user is on. Path-based URLs still work on prod — the server resolves
 * them — but the subdomain is the canonical end state.
 */

/** Public hub home as a path-based URL — used in dev, and as a non-redirected default on prod. */
export const buildHubHomePath = (subdomain: string): string => `/hub/${subdomain}`;

/** Hub settings entry — always the path-based form, on both dev and prod. */
export const buildHubSettingsPath = (subdomain: string): string => `/hub/${subdomain}/settings`;

/**
 * Public "view hub" URL. On production, returns the absolute subdomain URL
 * (`https://<subdomain>.<canonical-domain>`) so clicking the eye icon hops
 * the user onto the branded subdomain. On development (no real subdomains
 * on `localhost`), returns the path-based `/hub/<subdomain>` shape.
 */
export const buildPublicHubViewUrl = (subdomain: string): string => {
  if (import.meta.env.MODE !== 'production' || typeof window === 'undefined') {
    return buildHubHomePath(subdomain);
  }
  const { hostname, protocol } = window.location;
  // Strip any existing subdomain by taking the last two parts of the hostname
  // (e.g. `acme.alkemio.org` → `alkemio.org`). Falls back to the path-based
  // form if we can't determine a domain (single-label hostnames).
  const domain = hostname.split('.').slice(-2).join('.');
  if (!domain.includes('.')) {
    return buildHubHomePath(subdomain);
  }
  return `${protocol}//${subdomain}.${domain}`;
};

/**
 * True when the current host is a sub-host of the configured canonical domain
 * — used as the signal "we're on a hub subdomain" by the top navigation. On
 * development (no real subdomains on `localhost`) this is always `false`.
 */
export const isOnHubSubdomain = (canonicalDomain: string | undefined): boolean => {
  if (import.meta.env.MODE !== 'production' || !canonicalDomain || typeof window === 'undefined') {
    return false;
  }
  const { hostname } = window.location;
  return hostname !== canonicalDomain && hostname.endsWith(`.${canonicalDomain}`);
};

/**
 * Absolutise an in-app path against the canonical platform host when the
 * visitor is on a hub subdomain. Used by the top navigation so clicking "Home"
 * or any other platform link hops the user off the subdomain back to the main
 * domain. On dev (or when already on the canonical host), returns the path
 * unchanged.
 */
export const absolutiseToMainDomain = (path: string, canonicalDomain: string | undefined): string => {
  if (!isOnHubSubdomain(canonicalDomain) || !canonicalDomain) {
    return path;
  }
  // Already absolute — leave alone.
  if (/^[a-z]+:\/\//i.test(path) || path.startsWith('//')) {
    return path;
  }
  const { protocol } = window.location;
  return `${protocol}//${canonicalDomain}${path.startsWith('/') ? path : `/${path}`}`;
};
