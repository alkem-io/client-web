import { describe, expect, test } from 'vitest';

/**
 * Mirrors the contact-route decision in CrdUserProfilePage (FR-011):
 *   - chat and email are INDEPENDENT routes
 *   - offer chat whenever the recipient has chat on (`isContactable`)
 *   - offer email whenever the recipient has email contact on
 *     (`isContactableViaEmail`) — both may be shown together
 *   - when neither is on, no route is offered and we explain
 *   - any affordance requires the viewer to be allowed to contact at all
 *     (authenticated, not their own profile)
 *
 * Kept in lock-step with `CrdUserProfilePage.tsx` (`showChat` / `showEmail` /
 * `showCannotBeReached`).
 */
const contactRoute = (viewerCanContact: boolean, isContactable: boolean, isContactableViaEmail: boolean) => {
  const showChat = viewerCanContact && isContactable;
  const showEmail = viewerCanContact && isContactableViaEmail;
  const showCannotBeReached = viewerCanContact && !isContactable && !isContactableViaEmail;
  return { showChat, showEmail, showCannotBeReached };
};

describe('contact-route decision (US4 / FR-011)', () => {
  test('chat on, email off → chat route only', () => {
    expect(contactRoute(true, true, false)).toEqual({
      showChat: true,
      showEmail: false,
      showCannotBeReached: false,
    });
  });

  test('chat off, email on → email route only', () => {
    expect(contactRoute(true, false, true)).toEqual({
      showChat: false,
      showEmail: true,
      showCannotBeReached: false,
    });
  });

  test('chat on AND email on → BOTH routes offered together (independent flags)', () => {
    expect(contactRoute(true, true, true)).toEqual({
      showChat: true,
      showEmail: true,
      showCannotBeReached: false,
    });
  });

  test('chat off, email off → no route, explain cannot be reached', () => {
    expect(contactRoute(true, false, false)).toEqual({
      showChat: false,
      showEmail: false,
      showCannotBeReached: true,
    });
  });

  test('anonymous / own-profile viewer gets no affordance at all', () => {
    expect(contactRoute(false, true, true)).toEqual({
      showChat: false,
      showEmail: false,
      showCannotBeReached: false,
    });
  });
});
