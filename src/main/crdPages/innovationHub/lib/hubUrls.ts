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
