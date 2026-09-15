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
  providerConstructions: { value: 0 },
  userName: { value: 'Alice Brown' },
  guestIdentity: {
    value: { isPublicRoute: false, guestName: undefined } as { isPublicRoute: boolean; guestName: string | undefined },
  },
}));

vi.mock('@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity', () => ({
  resolveWhiteboardGuestIdentity: () => h.guestIdentity.value,
}));
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', () => ({
  UnifiedCollabProvider: class {
    state = { kind: 'loading' };
    readOnlyReason = undefined;
    hasUnsavedChanges = false;
    hasChangesAtRisk = false;
    awareness = {};
    ephemeralChannel = {};
    constructor() {
      h.providerConstructions.value += 1;
    }
    subscribe(listener: (state: { kind: string }) => void) {
      listener(this.state);
      return () => {};
    }
    onSaveResult() {
      return () => {};
    }
    connect() {}
    destroy() {}
    requestDurability() {
      return Promise.resolve();
    }
  },
}));
vi.mock('./collab/whiteboardEditorBinding', () => ({
  bindWhiteboardEditor: () => ({
    setUser: (username: string) => {
      h.capturedUsername.value = username;
    },
    fitScene: vi.fn(),
    destroy: vi.fn(),
    onPointerUpdate: vi.fn(),
    broadcastEmojiReaction: vi.fn(),
    broadcastCountdownTimer: vi.fn(),
  }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: h.userName.value } } }),
}));
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => props.onExcalidrawAPI?.({}), []);
      return null;
    },
  };
});
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
    >
      {({ children }) => <>{children}</>}
    </CollaborativeExcalidrawWrapper>
  );

describe('CollaborativeExcalidrawWrapper — awareness guest identity', () => {
  beforeEach(() => {
    h.capturedUsername.value = undefined;
    h.providerConstructions.value = 0;
    h.userName.value = 'Alice Brown';
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

  it('updates a late profile name without replacing the document provider', () => {
    const view = renderWrapper();
    expect(h.providerConstructions.value).toBe(1);
    h.userName.value = 'Alice Cooper';
    view.rerender(
      <CollaborativeExcalidrawWrapper
        entities={{ whiteboard: { id: 'wb-1' }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
        options={{}}
        actions={{}}
      >
        {({ children }) => <>{children}</>}
      </CollaborativeExcalidrawWrapper>
    );
    expect(h.providerConstructions.value).toBe(1);
    expect(h.capturedUsername.value).toBe('Alice Cooper');
  });
});
