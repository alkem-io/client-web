import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Native-Yjs replacement for the deleted Portal `onCloseConnection(hasError)` test (#10131).
 * The old socket `Portal` reported WHY a connection closed so the disconnected notice could
 * decide whether to offer the "Reload page" escape hatch. That layer is gone; in the native-Yjs
 * wrapper the same signal flows as: `useCollab` fires `onCloseConnection(hasError)` → the wrapper
 * stores it in `connectionError` → it forwards that as the `hasError` render-prop the disconnect
 * notice reads. This proves a FAILED reconnect (hasError=true) surfaces the escape hatch source and
 * a transient drop (hasError=false) does not. The notice's own hasError → Reload-button
 * visibility/action is covered by WhiteboardDisconnectedDialog.test.tsx.
 */
const h = vi.hoisted(() => ({
  collabProps: null as null | {
    onCloseConnection: (hasError: boolean) => void;
    onTerminalClose?: (reason: string) => void;
  },
  noticeHasError: [] as (boolean | undefined)[],
}));

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

vi.mock('@/domain/common/whiteboard/excalidraw/useAutoReconnect', () => ({
  useAutoReconnect: () => ({ secondsRemaining: null }),
}));

// Capture the close callbacks the wrapper hands useCollab so a failed/transient close can be
// simulated directly. Reports a not-collaborating state (the drop condition).
vi.mock('@/domain/common/whiteboard/excalidraw/collab/useCollab', () => ({
  default: (props: { onCloseConnection: (hasError: boolean) => void; onTerminalClose?: (reason: string) => void }) => {
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
        h.noticeHasError.push(props.hasError);
        return null;
      }}
    >
      {() => null}
    </CollaborativeExcalidrawWrapper>
  );
}

/** The most recent `hasError` the wrapper handed the disconnect-notice renderer. */
function latestNoticeHasError(): boolean | undefined {
  return h.noticeHasError[h.noticeHasError.length - 1];
}

describe('CollaborativeExcalidrawWrapper — #10131 reconnect-error escape-hatch source', () => {
  beforeEach(() => {
    h.collabProps = null;
    h.noticeHasError = [];
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('a failed-reconnect close (hasError=true) forwards hasError=true to the disconnect notice', () => {
    renderWrapper();
    expect(typeof h.collabProps?.onCloseConnection).toBe('function');

    act(() => {
      h.collabProps?.onCloseConnection(true);
    });

    expect(latestNoticeHasError()).toBe(true);
  });

  it('a transient drop (hasError=false) forwards hasError=false — no escape hatch', () => {
    renderWrapper();

    act(() => {
      h.collabProps?.onCloseConnection(false);
    });

    expect(latestNoticeHasError()).toBe(false);
  });
});
