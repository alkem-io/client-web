import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CloseVerdict } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * COMPOSITION test: the real `useCollab` routing wired into the wrapper. The
 * Here the provider is mocked only to inject a socket-close verdict; `useCollab`
 * and the wrapper are real. Established transient recovery stays non-blocking,
 * so a remote drop never opens the terminal/manual modal. Intentional local
 * closes are pinned at the provider boundary, where the close listener is
 * detached before close(1000).
 */
const h = vi.hoisted(() => ({
  closeHandler: { value: undefined as ((v: CloseVerdict) => void) | undefined },
  statusHandler: { value: undefined as ((status: string) => void) | undefined },
  syncedHandler: { value: undefined as ((synced: boolean) => void) | undefined },
  noticeOpen: [] as boolean[],
  viewModeEnabled: [] as (boolean | undefined)[],
  generateIdForFile: { value: undefined as ((file: File) => Promise<string>) | undefined },
}));

// Mock the provider so the wrapper's real useCollab still subscribes to a `close`
// event we can drive, without a live socket.
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  class MockProvider {
    awareness = { setLocalStateField: vi.fn(), on: vi.fn(), off: vi.fn(), destroy: vi.fn() };
    ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
    hasUnconfirmedLocalChanges = false;
    on(event: string, handler: (value: never) => void) {
      if (event === 'close') h.closeHandler.value = handler as (value: CloseVerdict) => void;
      else if (event === 'status') h.statusHandler.value = handler as (status: string) => void;
      else if (event === 'synced') h.syncedHandler.value = handler as (synced: boolean) => void;
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
    lazyWithGlobalErrorHandler:
      () =>
      (props: {
        onExcalidrawAPI?: (api: unknown) => void;
        viewModeEnabled?: boolean;
        generateIdForFile?: (file: File) => Promise<string>;
      }) => {
        React.useEffect(() => {
          props.onExcalidrawAPI?.({ id: 'api-1', getSceneElements: () => [] });
        }, []);
        h.viewModeEnabled.push(props.viewModeEnabled);
        h.generateIdForFile.value = props.generateIdForFile;
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
    h.statusHandler.value = undefined;
    h.syncedHandler.value = undefined;
    h.noticeOpen.length = 0;
    h.viewModeEnabled.length = 0;
    h.generateIdForFile.value = undefined;
  });
  afterEach(() => vi.clearAllMocks());

  it('a TRANSIENT close keeps the editor active, the blocking notice closed, and rejects new image bytes', async () => {
    renderWrapper();

    act(() => {
      h.statusHandler.value?.('connected');
      h.syncedHandler.value?.(true);
    });
    expect(h.viewModeEnabled.at(-1)).not.toBe(true);

    act(() => {
      h.syncedHandler.value?.(false);
      h.statusHandler.value?.('disconnected');
      h.closeHandler.value?.({ code: 1011, reason: '', disposition: 'transient' });
    });

    expect(latestNoticeOpen()).toBe(false);
    expect(h.viewModeEnabled.at(-1)).not.toBe(true);
    expect(h.generateIdForFile.value).toBeTypeOf('function');
    await expect(
      h.generateIdForFile.value?.(new File(['image'], 'offline.png', { type: 'image/png' })) as Promise<string>
    ).rejects.toThrow('callout.whiteboard.images.uploadFailed');
  });
});
