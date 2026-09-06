import { GUEST_SHARE_PATH } from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import { validateGuestName } from './guestNameValidator';
import { getGuestName } from './sessionStorage';

export type WhiteboardGuestIdentity = {
  /** Whether the current route is the public/guest whiteboard route. */
  isPublicRoute: boolean;
  /**
   * The single validated guest identity for this session, or `undefined`. Defined ONLY on
   * the public/guest whiteboard route; off it the user is identified by their auth cookie
   * (and their real display name is shown), so there is no guest identity.
   */
  guestName: string | undefined;
};

/**
 * The ONE route-aware, validated guest identity for whiteboard collaboration — the single
 * value that feeds the WS `?guestName`, the asset `x-guest-name` header, and the awareness
 * cursor label, so a session can never be attributed three different ways (or leak the real
 * name on a public link).
 *
 * The guest-session value is already anonymized for authenticated users (`useGuestSession`
 * writes `anonymizeGuestName(...)` there) and is the entered nickname for pure guests. This
 * route-gates it to the public route and validates it, failing CLOSED (`undefined`) on an
 * invalid name. Callers must use this rather than reading `sessionStorage` /
 * `GuestSessionContext` directly, so all sinks stay in lockstep.
 */
export function resolveWhiteboardGuestIdentity(): WhiteboardGuestIdentity {
  const isPublicRoute = !!globalThis.window?.location.pathname.startsWith(GUEST_SHARE_PATH);
  if (!isPublicRoute) {
    return { isPublicRoute: false, guestName: undefined };
  }
  const name = (getGuestName() ?? '').trim();
  const guestName = name && validateGuestName(name).valid ? name : undefined;
  return { isPublicRoute: true, guestName };
}
