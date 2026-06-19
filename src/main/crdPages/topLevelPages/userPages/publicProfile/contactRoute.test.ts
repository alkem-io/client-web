import { describe, expect, test } from 'vitest';

/**
 * Mirrors the contact-route decision in CrdUserProfilePage (FR-011):
 *   - chat is the default and preferred route
 *   - the email fallback is offered ONLY when chat is off AND email is on
 *   - when both are off, no route is offered and we explain
 */
const contactRoute = (viewerCanContact: boolean, isContactable: boolean, isContactableViaEmail: boolean) => {
  const emailFallbackOnly = !isContactable && isContactableViaEmail;
  const showMessageButton = viewerCanContact && (isContactable || emailFallbackOnly);
  const showCannotBeReached = viewerCanContact && !isContactable && !isContactableViaEmail;
  return { emailFallbackOnly, showMessageButton, showCannotBeReached };
};

describe('contact-route decision (US4 / FR-011)', () => {
  test('chat enabled → chat route, no email fallback', () => {
    expect(contactRoute(true, true, false)).toEqual({
      emailFallbackOnly: false,
      showMessageButton: true,
      showCannotBeReached: false,
    });
  });

  test('chat off + email on → email fallback offered', () => {
    expect(contactRoute(true, false, true)).toEqual({
      emailFallbackOnly: true,
      showMessageButton: true,
      showCannotBeReached: false,
    });
  });

  test('chat off + email off → no route, explain cannot be reached', () => {
    expect(contactRoute(true, false, false)).toEqual({
      emailFallbackOnly: false,
      showMessageButton: false,
      showCannotBeReached: true,
    });
  });

  test('email route is NOT offered when chat is on even if email is also on', () => {
    expect(contactRoute(true, true, true).emailFallbackOnly).toBe(false);
  });

  test('anonymous / own-profile viewer gets no affordance at all', () => {
    expect(contactRoute(false, true, true)).toEqual({
      emailFallbackOnly: false,
      showMessageButton: false,
      showCannotBeReached: false,
    });
  });
});
