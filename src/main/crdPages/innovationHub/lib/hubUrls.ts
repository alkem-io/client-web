/**
 * Canonical URL helpers for Innovation Hubs.
 *
 * Every Innovation Hub has TWO identifiers, and they can diverge:
 *
 *   - `nameID`    — used in the route URL (`/hub/:innovationHubNameId`). The
 *                   server's URL resolver looks up the hub by this value.
 *   - `subdomain` — used in the hostname (`<subdomain>.alkemio.org`). The
 *                   server reads the host header to resolve a hub from a
 *                   subdomain visit.
 *
 * The two often coincide for hubs whose display-name slug matches their
 * subdomain (e.g. "bobby" / "bobby"), but they don't have to — a "Demo Hub"
 * might be created with `nameID = demo-hub-1` and `subdomain = demo`, and
 * using `subdomain` in a path URL would 404 (the resolver wouldn't find it).
 *
 * Path URLs MUST always use `nameID`. Subdomain hostnames MUST always use
 * `subdomain`. These helpers enforce that contract.
 *
 * Subdomain detection helpers (`isOnHubSubdomain`, `absolutiseToMainDomain`)
 * live in `@/main/routing/urlBuilders` — they're routing-level concerns shared
 * across the layout, not hub-feature details.
 */

/** Public hub home as a path-based URL. `nameID` is the route param the server resolves. */
export const buildHubHomePath = (nameID: string): string => `/hub/${nameID}`;

/** Hub settings entry — always the path-based form, on both dev and prod. */
export const buildHubSettingsPath = (nameID: string): string => `/hub/${nameID}/settings`;

/**
 * Public "view hub" URL — used by the eye icon on the Settings sticky header.
 *
 * - Prod: returns the absolute subdomain URL (`https://<subdomain>.<canonical-domain>`)
 *   so the URL bar shows the branded subdomain.
 * - Dev (no real subdomains on `localhost`): returns the path-based `/hub/<nameID>`.
 *
 * Takes BOTH identifiers because prod-vs-dev pick different ones: prod uses
 * the hostname (subdomain), dev uses the route param (nameID).
 */
export const buildPublicHubViewUrl = (nameID: string, subdomain: string): string => {
  if (import.meta.env.MODE !== 'production' || typeof window === 'undefined') {
    return buildHubHomePath(nameID);
  }
  const { hostname, protocol } = window.location;
  // Strip any existing subdomain by taking the last two parts of the hostname
  // (e.g. `acme.alkemio.org` → `alkemio.org`). Falls back to the path-based
  // form if we can't determine a domain (single-label hostnames).
  const domain = hostname.split('.').slice(-2).join('.');
  if (!domain.includes('.')) {
    return buildHubHomePath(nameID);
  }
  return `${protocol}//${subdomain}.${domain}`;
};
