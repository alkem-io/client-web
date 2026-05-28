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
 *
 * Subdomain detection helpers (`isOnHubSubdomain`, `absolutiseToMainDomain`)
 * live in `@/main/routing/urlBuilders` — they're routing-level concerns shared
 * across the layout, not hub-feature details.
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
