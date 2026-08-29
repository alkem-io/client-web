import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * #14 — the awareness cursor label (the name peers SEE) must never be the authenticated
 * user's real display name on a PUBLIC whiteboard link; it must be the same validated
 * guest identity the WS handshake + asset header use. Off the public route it is the real
 * display name. This captures the `username` the wrapper hands to useCollab (which sets it
 * on awareness).
 */
const h = vi.hoisted(() => ({
  capturedUsername: { value: undefined as string | undefined },
  guestIdentity: {
    value: { isPublicRoute: false, guestName: undefined } as { isPublicRoute: boolean; guestName: string | undefined },
  },
}));

vi.mock('@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity', () => ({
  resolveWhiteboardGuestIdentity: () => h.guestIdentity.value,
}));
vi.mock('./collab/useCollab', () => ({
  default: (opts: { username: string }) => {
    h.capturedUsername.value = opts.username;
    return [
      null,
      () => () => {},
      { connecting: false, collaborating: false, mode: null, modeReason: null, isReadOnly: false },
    ];
  },
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: 'Alice Brown' } } }),
}));
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', () => ({ lazyWithGlobalErrorHandler: () => () => null }));
vi.mock('./useAutoReconnect', () => ({ useAutoReconnect: () => ({ secondsRemaining: null }) }));
vi.mock('./useWhiteboardDefaults', () => ({ default: () => ({}) }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/shared/utils/useCombinedRefs', () => ({ useCombinedRefs: () => ({ current: null }) }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? 'Guest' }),
}));

const renderWrapper = () =>
  render(
    <CollaborativeExcalidrawWrapper
      entities={{ whiteboard: { id: 'wb-1' }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
      options={{}}
      actions={{}}
      renderDisconnectNotice={() => null}
    >
      {({ children }) => <>{children}</>}
    </CollaborativeExcalidrawWrapper>
  );

describe('CollaborativeExcalidrawWrapper — awareness guest identity', () => {
  beforeEach(() => {
    h.capturedUsername.value = undefined;
    h.guestIdentity.value = { isPublicRoute: false, guestName: undefined };
  });
  afterEach(() => vi.clearAllMocks());

  it('a PUBLIC link broadcasts the anonymized guest identity, NEVER the real display name', () => {
    h.guestIdentity.value = { isPublicRoute: true, guestName: 'Alice B' };
    renderWrapper();
    expect(h.capturedUsername.value).toBe('Alice B');
    expect(h.capturedUsername.value).not.toBe('Alice Brown');
  });

  it('a PUBLIC link with no/invalid guest name falls back to a generic guest label, NOT the real name', () => {
    h.guestIdentity.value = { isPublicRoute: true, guestName: undefined };
    renderWrapper();
    expect(h.capturedUsername.value).toBe('Guest');
    expect(h.capturedUsername.value).not.toBe('Alice Brown');
  });

  it('a PRIVATE route shows the authenticated user’s real display name', () => {
    h.guestIdentity.value = { isPublicRoute: false, guestName: undefined };
    renderWrapper();
    expect(h.capturedUsername.value).toBe('Alice Brown');
  });
});
