import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Proves terminal and transient closes remain distinct after reconnect ownership
 * moves entirely into the provider. The wrapper only renders state and manual retry.
 */
const h = vi.hoisted(() => ({
  collabProps: null as null | {
    onCloseConnection: () => void;
    onSceneInitChange?: (initialized: boolean) => void;
    onTerminalClose?: (reason: string) => void;
  },
  noticeReasons: [] as (string | null)[],
  noticeOpen: [] as boolean[],
  dirty: false,
}));

// The wrapper builds <Excalidraw> via lazyWithGlobalErrorHandler; replace it with a
// no-op so no dynamic import / CSS side effect runs (the editor is never rendered here).
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', () => ({
  lazyWithGlobalErrorHandler: () => () => null,
  lazyImportWithErrorHandler: () => Promise.resolve({}),
  LazyLoadError: class extends Error {},
}));

vi.mock('@excalidraw-yjs/excalidraw', () => ({
  Excalidraw: () => null,
  decodeSnapshot: () => ({ elements: [], appState: {}, files: {}, assets: {} }),
  encodeSnapshot: () => new Uint8Array(),
  CaptureUpdateAction: { IMMEDIATELY: 'immediately' },
  hashElementsVersion: () => 0,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/core/logging/sentry/log', () => ({
  error: vi.fn(),
  warn: vi.fn(),
  TagCategoryValues: { WHITEBOARD: 'whiteboard' },
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: undefined }),
}));
vi.mock('@/domain/common/whiteboard/excalidraw/useWhiteboardDefaults', () => ({ default: () => ({}) }));

// Capture the close callbacks the wrapper passes to useCollab so the test can simulate
// a socket close directly. Report a not-yet-collaborating state (the drop condition).
vi.mock('@/domain/common/whiteboard/excalidraw/collab/useCollab', () => ({
  default: (props: {
    onCloseConnection: () => void;
    onSceneInitChange?: (initialized: boolean) => void;
    onTerminalClose?: (reason: string) => void;
  }) => {
    h.collabProps = props;
    return [
      { hasUnconfirmedLocalChanges: () => h.dirty },
      () => () => {},
      {
        connecting: false,
        collaborating: true,
        mode: 'write',
        modeReason: null,
        isReadOnly: false,
        phase: 'live',
        hasEverSynced: true,
        hasUnconfirmedLocalChanges: false,
      },
    ];
  },
}));

// Imported AFTER the mocks (vitest hoists vi.mock above imports).
import CollaborativeExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';

function renderWrapper() {
  render(
    <CollaborativeExcalidrawWrapper
      entities={{
        whiteboard: { id: 'wb-1', profile: { url: '/wb-1' } },
        assetAdapter: {} as never,
        lastSuccessfulSavedDate: undefined,
      }}
      options={{} as never}
      actions={{}}
      renderDisconnectNotice={props => {
        h.noticeReasons.push(props.terminalCloseReason);
        h.noticeOpen.push(props.open);
        return null;
      }}
    >
      {() => null}
    </CollaborativeExcalidrawWrapper>
  );
}

describe('CollaborativeExcalidrawWrapper — close disposition presentation', () => {
  beforeEach(() => {
    h.collabProps = null;
    h.noticeReasons = [];
    h.noticeOpen = [];
    h.dirty = false;
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('a TERMINAL close exposes its policy reason', () => {
    renderWrapper();
    // The wrapper must have wired the terminal-close callback.
    expect(typeof h.collabProps?.onTerminalClose).toBe('function');

    act(() => {
      h.collabProps?.onTerminalClose?.('forbidden');
    });

    expect(h.noticeReasons[h.noticeReasons.length - 1]).toBe('forbidden');
  });

  it('a dirty terminal close preserves the scene for the existing export action', () => {
    h.dirty = true;
    renderWrapper();
    act(() => h.collabProps?.onSceneInitChange?.(true));
    expect(screen.queryByText('pages.whiteboard.loadingScene')).not.toBeInTheDocument();

    act(() => h.collabProps?.onTerminalClose?.('forbidden'));

    expect(screen.queryByText('pages.whiteboard.loadingScene')).not.toBeInTheDocument();
    expect(h.noticeOpen[h.noticeOpen.length - 1]).toBe(true);
  });

  it('a TRANSIENT close leaves the blocking reconnect notice closed', () => {
    renderWrapper();

    act(() => {
      h.collabProps?.onCloseConnection();
    });

    expect(h.noticeOpen[h.noticeOpen.length - 1]).toBe(false);
  });
});
