import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixSession } from './MatrixSessionProvider';

const APEX = 'https://alkem.io';
const IDENTITY_ORIGIN = 'https://identity.alkem.io';
const HUB_ORIGIN = 'https://hub.example.org';

const harness = vi.hoisted(() => {
  const harnessState = {
    signals: [] as AbortSignal[],
    // Never settles: establishment is still in flight whenever the component is torn down.
    establishSession: vi.fn((_actorId: string, options?: { signal?: AbortSignal }) => {
      if (options?.signal) {
        harnessState.signals.push(options.signal);
      }
      return new Promise(() => {});
    }),
    actorId: { value: 'actor-1' as string | undefined },
    platformOrigin: { value: 'https://alkem.io' as string | undefined },
    identityOrigin: { value: 'https://identity.alkem.io' as string | undefined },
  };
  return harnessState;
});

vi.mock('./sessionController', () => ({
  establishSession: harness.establishSession,
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: harness.actorId.value ? { id: harness.actorId.value } : undefined }),
}));

vi.mock('@/domain/platform/routes/usePlatformOrigin', () => ({
  default: () => harness.platformOrigin.value,
}));

vi.mock('@/domain/platform/routes/useIdentityOrigin', () => ({
  default: () => harness.identityOrigin.value,
}));

const servedFrom = (origin: string) => vi.stubGlobal('location', { origin, pathname: '/', search: '' });

describe('MatrixSession', () => {
  beforeEach(() => {
    harness.establishSession.mockClear();
    harness.signals = [];
    harness.actorId.value = 'actor-1';
    harness.platformOrigin.value = APEX;
    harness.identityOrigin.value = IDENTITY_ORIGIN;
    servedFrom(APEX);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes the platform origin to the session, and waits until it is known', () => {
    harness.platformOrigin.value = undefined;
    const { rerender } = render(<MatrixSession />);
    expect(harness.establishSession).not.toHaveBeenCalled();

    harness.platformOrigin.value = APEX;
    rerender(<MatrixSession />);
    expect(harness.establishSession).toHaveBeenCalledOnce();
    expect(harness.establishSession.mock.calls[0][1]).toMatchObject({ platformOrigin: APEX });
  });

  it('establishes a session for the signed-in actor', () => {
    render(<MatrixSession />);
    expect(harness.establishSession).toHaveBeenCalledOnce();
    expect(harness.establishSession.mock.calls[0][0]).toBe('actor-1');
  });

  it('does nothing without a signed-in user', () => {
    harness.actorId.value = undefined;
    render(<MatrixSession />);
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('stops the session when the component unmounts, even while establishment is still running', () => {
    const { unmount } = render(<MatrixSession />);
    expect(harness.signals[0]?.aborted).toBe(false);
    unmount();
    expect(harness.signals[0]?.aborted).toBe(true);
  });

  it('stops the old session and establishes a new one when the actor changes', () => {
    const { rerender } = render(<MatrixSession />);
    expect(harness.establishSession).toHaveBeenCalledTimes(1);

    harness.actorId.value = 'actor-2';
    rerender(<MatrixSession />);

    expect(harness.signals[0]?.aborted).toBe(true);
    expect(harness.signals[1]?.aborted).toBe(false);
    expect(harness.establishSession).toHaveBeenCalledTimes(2);
    expect(harness.establishSession.mock.calls[1][0]).toBe('actor-2');
  });

  describe('origin the page is served from', () => {
    // This provider is mounted above the routes, so sign-in runs it once on the
    // identity origin before `NonIdentity` replaces the location with the apex.
    it('does not start on the identity origin: the credentials would land in storage the apex never reads', () => {
      servedFrom(IDENTITY_ORIGIN);

      render(<MatrixSession />);

      expect(harness.establishSession).not.toHaveBeenCalled();
    });

    it('starts on the platform origin, where the callback persists the credentials itself', () => {
      servedFrom(APEX);

      render(<MatrixSession />);

      expect(harness.establishSession).toHaveBeenCalledOnce();
    });

    // The regression a `window.location.origin === platformOrigin` gate would
    // cause: a hub is a legitimate third origin served the same app, and the
    // callback's `parent` handoff posts it the token.
    it('starts on an innovation-hub origin, which is neither the apex nor the identity origin', () => {
      servedFrom(HUB_ORIGIN);

      render(<MatrixSession />);

      expect(harness.establishSession).toHaveBeenCalledOnce();
      expect(harness.establishSession.mock.calls[0][1]).toMatchObject({ platformOrigin: APEX });
    });

    it('uses the CONFIGURED identity origin, not an `identity.` naming convention', () => {
      // Without this case the guard can be written as a hardcoded
      // `origin.startsWith('https://identity.')` and the whole suite stays
      // green, because every other fixture happens to sit outside that prefix.
      // The identity origin is whatever the platform config says it is, so a
      // deployment that does not follow the subdomain convention must still be
      // recognised — otherwise chat breaks there in exactly the way this fix
      // exists to repair, and no test would notice.
      harness.identityOrigin.value = 'https://auth.partner.example';
      servedFrom('https://auth.partner.example');

      render(<MatrixSession />);

      expect(harness.establishSession).not.toHaveBeenCalled();
    });

    it('starts when the identity origin is not configured, so an unconfigured provider cannot block chat', () => {
      harness.identityOrigin.value = undefined;
      servedFrom(APEX);

      render(<MatrixSession />);

      expect(harness.establishSession).toHaveBeenCalledOnce();
    });
  });
});
