/**
 * The push payload's target, reduced to something react-router can navigate to.
 *
 * `spec 086` FR-007 pins the field transport-verbatim at `notification.data.url`
 * on both platforms (FCM `data: { url }`, APNs top-level `url`), and the server
 * renders it either as an absolute URL rooted at the serving origin or as the
 * bare `'/'` home link. `navigate()` treats an absolute `https://…` string as a
 * *relative* path, so the raw value is never router-usable as-is.
 *
 * `undefined` is the documented **"stay on the start route"** outcome: the tap
 * still opens the app, it just does not route anywhere. That covers a target on
 * a different origin, a protocol-relative `//evil.example` (bare, or hidden in
 * the path of an origin-rooted url), a non-http(s) scheme, a non-string and an
 * empty string — the payload crosses APNs/FCM, so it is normalised, never
 * trusted.
 *
 * `origin` is a parameter rather than a read of `window.location.origin` so the
 * function stays pure; the caller passes the serving origin. Only that one
 * origin is accepted, which is why this is not
 * `core/utils/links.ts`'s `resolveInternalReturnPath` — that helper also admits
 * the configured apex alongside the current origin, for an auth-flow
 * `return_to` that is deliberately set from a sibling subdomain.
 *
 * There is deliberately no separate protocol check: comparing `URL.origin`
 * already rejects every non-http(s) scheme, because only http(s) (and ws(s)/ftp,
 * whose origin can never equal an http(s) one) get a tuple origin at all —
 * `javascript:`, `data:` and friends all resolve to the opaque `'null'`.
 */
export const normalizePushTargetUrl = (raw: unknown, origin: string): string | undefined => {
  if (typeof raw !== 'string' || !raw) {
    return undefined;
  }

  let target: URL;
  try {
    target = new URL(raw, origin);
  } catch {
    return undefined;
  }

  if (target.origin !== origin) {
    return undefined;
  }

  // `new URL('<origin>//evil.example/x', origin)` is same-origin with pathname
  // `'//evil.example/x'`, which react-router keeps verbatim and `pushState`
  // then rejects as cross-origin — falling back to `location.assign()` on the
  // attacker's authority. The origin check alone does not cover this shape.
  if (target.pathname.startsWith('//')) {
    return undefined;
  }

  return `${target.pathname}${target.search}${target.hash}`;
};
