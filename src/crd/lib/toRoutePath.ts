/**
 * Normalises any URL-or-path into a value safe to pass to react-router's
 * `useNavigate`. The Alkemio server returns full URLs (e.g.
 * `http://localhost:3000/welcome-space`) on `profile.url` fields, but
 * react-router-dom v6 treats anything that isn't a `/`-prefixed pathname as
 * **relative** — so calling `navigate('http://localhost:3000/welcome-space')`
 * from `/welcome-space/collaboration/x` appends the whole string verbatim,
 * producing the recursive `…/http:/localhost:3000/welcome-space/http:/…`
 * URL we saw on close. Routing the value through `new URL()` keeps only the
 * path, search, and hash so navigation lands on the intended route.
 *
 * Accepts:
 *   - Full URL with origin (`http://host/path`) → returns `/path`.
 *   - Origin-relative path (`/welcome-space`) → returned unchanged.
 *   - `.` / undefined → returns `.` (current-route relative — used as a
 *     no-op fallback by the caller).
 */
export function toRoutePath(input: string | null | undefined): string {
  if (!input || input === '.') return '.';
  // Already a pathname — leave it alone.
  if (input.startsWith('/')) return input;
  try {
    const parsed = new URL(input);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Not a parseable URL and not a pathname — fall back to the current
    // route rather than risk a recursive concatenation.
    return '.';
  }
}
