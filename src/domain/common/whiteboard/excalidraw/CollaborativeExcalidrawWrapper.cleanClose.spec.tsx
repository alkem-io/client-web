import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CloseVerdict } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * COMPOSITION test: the real `useCollab` routing wired into the wrapper. The
 * Here the provider is mocked only to inject a socket-close verdict; `useCollab`
 * and the wrapper are real. A clean (normal 1000) close reaches neither wrapper
 * callback, so the reconnect notice stays closed; a transient drop opens it.
 */
const h = vi.hoisted(() => ({
  closeHandler: { value: undefined as ((v: CloseVerdict) => void) | undefined },
  noticeOpen: [] as boolean[],
}));

// Mock the provider so the wrapper's real useCollab still subscribes to a `close`
// event we can drive, without a live socket.
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  class MockProvider {
    awareness = { setLocalStateField: vi.fn(), on: vi.fn(), off: vi.fn(), destroy: vi.fn() };
    ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
    on(event: string, handler: (v: CloseVerdict) => void) {
      if (event === 'close') h.closeHandler.value = handler;
    }
    off() {}
    connect() {}
    destroy() {}
  }
  return { ...actual, UnifiedCollabProvider: MockProvider };
});
vi.mock('./collab/awarenessRouter', () => ({
  AwarenessRouter: class {
    destroy() {}
  },
}));

// A stub <Excalidraw> that hands back an API on mount so useCollab initializes
// (and thus subscribes to the provider's `close`).
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => {
        props.onExcalidrawAPI?.({ id: 'api-1' });
      }, []);
      return null;
    },
  };
});
vi.mock('./useWhiteboardDefaults', () => ({ default: () => ({}) }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: 'Tester' } } }),
}));
vi.mock('@/domain/shared/utils/useCombinedRefs', () => ({ useCombinedRefs: () => ({ current: null }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const renderWrapper = () =>
  render(
    <CollaborativeExcalidrawWrapper
      entities={{ whiteboard: { id: 'wb-1' }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
      options={{}}
      actions={{}}
      renderDisconnectNotice={props => {
        h.noticeOpen.push(props.open);
        return null;
      }}
    >
      {({ children }) => <>{children}</>}
    </CollaborativeExcalidrawWrapper>
  );

const latestNoticeOpen = () => h.noticeOpen[h.noticeOpen.length - 1];

describe('CollaborativeExcalidrawWrapper — close disposition controls the reconnect notice', () => {
  beforeEach(() => {
    h.closeHandler.value = undefined;
    h.noticeOpen.length = 0;
  });
  afterEach(() => vi.clearAllMocks());

  it('a NORMAL (clean 1000) close leaves the reconnect notice closed', () => {
    renderWrapper();
    expect(typeof h.closeHandler.value).toBe('function'); // real useCollab subscribed

    act(() => {
      h.closeHandler.value?.({ code: 1000, reason: '', disposition: 'normal' });
    });

    expect(latestNoticeOpen()).toBe(false);
  });

  it('a TRANSIENT close opens the reconnect notice while the provider owns retry', () => {
    renderWrapper();

    act(() => {
      h.closeHandler.value?.({ code: 1011, reason: '', disposition: 'transient' });
    });

    expect(latestNoticeOpen()).toBe(true);
  });
});
