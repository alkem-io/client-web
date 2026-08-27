import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Proves the SECOND, independent retry loop — the wrapper's `useAutoReconnect`
 * countdown that fires `restartCollaboration` — is switched OFF on a TERMINAL policy
 * close and stays ON for a transient drop. `useCollab` is mocked to capture the
 * `onCloseConnection` / `onTerminalClose` callbacks the wrapper hands it (so a close
 * can be simulated without a socket) and `useAutoReconnect` is mocked to capture the
 * `active` flag it is called with. If the wrapper did not gate `active` off on a
 * terminal close, the countdown would keep calling `restartCollaboration` — the very
 * loop this fix removes.
 */
const h = vi.hoisted(() => ({
  collabProps: null as null | { onCloseConnection: () => void; onTerminalClose?: (reason: string) => void },
  autoReconnectActive: [] as boolean[],
  noticeReasons: [] as (string | null)[],
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

// Capture the `active` flag every time the wrapper drives the auto-reconnect countdown.
vi.mock('@/domain/common/whiteboard/excalidraw/useAutoReconnect', () => ({
  useAutoReconnect: (params: { active: boolean }) => {
    h.autoReconnectActive.push(params.active);
    return { secondsRemaining: null };
  },
}));

// Capture the close callbacks the wrapper passes to useCollab so the test can simulate
// a socket close directly. Report a not-yet-collaborating state (the drop condition).
vi.mock('@/domain/common/whiteboard/excalidraw/collab/useCollab', () => ({
  default: (props: { onCloseConnection: () => void; onTerminalClose?: (reason: string) => void }) => {
    h.collabProps = props;
    return [
      null,
      () => () => {},
      { connecting: false, collaborating: false, mode: null, modeReason: null, isReadOnly: true },
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
        return null;
      }}
    >
      {() => null}
    </CollaborativeExcalidrawWrapper>
  );
}

/** The most recent `active` flag the wrapper drove `useAutoReconnect` with. */
function latestActive(): boolean {
  return h.autoReconnectActive[h.autoReconnectActive.length - 1];
}

describe('CollaborativeExcalidrawWrapper — terminal close disables the wrapper reconnect timer', () => {
  beforeEach(() => {
    h.collabProps = null;
    h.autoReconnectActive = [];
    h.noticeReasons = [];
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('a TERMINAL close forces useAutoReconnect active:false (the countdown never restarts collaboration)', () => {
    renderWrapper();
    // The wrapper must have wired the terminal-close callback.
    expect(typeof h.collabProps?.onTerminalClose).toBe('function');

    act(() => {
      h.collabProps?.onTerminalClose?.('forbidden');
    });

    // Notice open + not collaborating, but the terminal verdict gates the timer OFF.
    expect(latestActive()).toBe(false);
    expect(h.noticeReasons[h.noticeReasons.length - 1]).toBe('forbidden');
  });

  it('a TRANSIENT close keeps useAutoReconnect active:true (auto-reconnect stays running)', () => {
    renderWrapper();

    act(() => {
      h.collabProps?.onCloseConnection();
    });

    // Notice open + not collaborating + no terminal verdict → keep retrying.
    expect(latestActive()).toBe(true);
  });
});
