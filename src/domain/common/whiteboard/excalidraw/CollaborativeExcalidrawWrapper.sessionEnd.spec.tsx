import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionEndInfo } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * #3 — the wrapper's session-end outcomes. useCollab is mocked to capture the
 * `onSessionEnd` callback, while the disconnect renderer captures the explicit
 * reconnect action. The <Excalidraw> is a mount-counter so a fresh generation is visible.
 */
const h = vi.hoisted(() => ({
  onSessionEnd: { value: undefined as ((info: SessionEndInfo) => void) | undefined },
  onReconnect: { value: undefined as (() => void) | undefined },
  notifications: [] as string[],
  mountCount: { value: 0 },
  editorInvalidatedCount: { value: 0 },
  publishedApi: { value: null as string | null },
  apiEvents: [] as string[],
  reconnect: vi.fn(),
  initializeCount: { value: 0 },
  cleanupCount: { value: 0 },
  collabState: {
    connecting: false,
    collaborating: false,
    mode: null as 'read' | 'write' | null,
    modeReason: null as string | null,
    isReadOnly: false,
  },
}));

vi.mock('./collab/useCollab', () => ({
  default: (opts: { onSessionEnd?: (info: SessionEndInfo) => void }) => {
    h.onSessionEnd.value = opts.onSessionEnd;
    return [
      { reconnect: h.reconnect },
      () => {
        h.initializeCount.value += 1;
        return () => {
          h.cleanupCount.value += 1;
        };
      },
      h.collabState,
    ];
  },
}));
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => {
        h.mountCount.value += 1;
        props.onExcalidrawAPI?.({ id: `api-${h.mountCount.value}` });
      }, []);
      return null;
    },
  };
});
vi.mock('./useWhiteboardDefaults', () => ({ default: () => ({}) }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => (message: string) => h.notifications.push(message),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: 'Tester' } } }),
}));
vi.mock('@/domain/shared/utils/useCombinedRefs', () => ({ useCombinedRefs: () => ({ current: null }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const wrapper = (whiteboardId = 'wb-1') => (
  <CollaborativeExcalidrawWrapper
    entities={{ whiteboard: { id: whiteboardId }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
    options={{}}
    actions={{
      onInitApi: api => {
        const id = (api as unknown as { id: string }).id;
        h.publishedApi.value = id;
        h.apiEvents.push(`api:${id}`);
      },
      onEditorInvalidated: () => {
        h.editorInvalidatedCount.value += 1;
        h.publishedApi.value = null;
        h.apiEvents.push('invalidate');
      },
    }}
    renderDisconnectNotice={props => {
      h.onReconnect.value = props.onReconnect;
      return null;
    }}
  >
    {({ children }) => <>{children}</>}
  </CollaborativeExcalidrawWrapper>
);

const renderWrapper = () => render(wrapper());

const send = (info: SessionEndInfo) => act(() => h.onSessionEnd.value?.(info));

describe('CollaborativeExcalidrawWrapper — session-end outcomes', () => {
  beforeEach(() => {
    h.onSessionEnd.value = undefined;
    h.onReconnect.value = undefined;
    h.notifications.length = 0;
    h.mountCount.value = 0;
    h.editorInvalidatedCount.value = 0;
    h.publishedApi.value = null;
    h.apiEvents.length = 0;
    h.reconnect.mockClear();
    h.initializeCount.value = 0;
    h.cleanupCount.value = 0;
    h.collabState.connecting = false;
    h.collabState.collaborating = false;
    h.collabState.mode = null;
    h.collabState.modeReason = null;
    h.collabState.isReadOnly = false;
  });
  afterEach(() => vi.clearAllMocks());

  it('transient: informational only — no discard, no retry-notice arming (no second reconnect trigger)', () => {
    renderWrapper();
    send({ code: 'update-rate-exceeded', scope: 'member', disposition: 'transient' });
    expect(h.editorInvalidatedCount.value).toBe(0); // nothing discarded
    expect(h.notifications).toContain('callout.whiteboard.session.rateExceeded');
  });

  it('transient update-not-accepted: reconnect notice only — no discard, no retry-notice arming', () => {
    renderWrapper();
    send({ code: 'update-not-accepted', scope: 'member', disposition: 'transient' });
    expect(h.editorInvalidatedCount.value).toBe(0); // nothing discarded
    expect(h.notifications).toContain('callout.whiteboard.session.updateNotAccepted');
  });

  it('transient server shutdown preserves the editor generation', () => {
    renderWrapper();
    send({ code: 'server-shutdown', scope: 'document', disposition: 'transient' });
    expect(h.editorInvalidatedCount.value).toBe(0);
    expect(h.notifications).toContain('callout.whiteboard.session.serverShutdown');
  });

  it('manual (size-limit): discards the generation + disables auto-reconnect; the restart mints a fresh generation', () => {
    renderWrapper();
    const mountsBefore = h.mountCount.value;
    send({ code: 'document-size-limit-exceeded', scope: 'member', disposition: 'manual' });
    expect(h.editorInvalidatedCount.value).toBe(1); // poisoned generation torn down
    expect(h.notifications).toContain('callout.whiteboard.session.sizeLimitExceeded');
    // The explicit user restart mints a FRESH generation (remount) before reconnecting.
    act(() => h.onReconnect.value?.());
    expect(h.mountCount.value).toBeGreaterThan(mountsBefore);
  });

  it('an inactivity restart replaces the live downgraded binding instead of reconnecting its open socket', () => {
    h.collabState.collaborating = true;
    h.collabState.mode = 'read';
    h.collabState.modeReason = 'inactivity';
    renderWrapper();
    expect(h.initializeCount.value).toBe(1);

    act(() => h.onReconnect.value?.());

    expect(h.cleanupCount.value).toBe(1);
    expect(h.initializeCount.value).toBe(2);
    expect(h.reconnect).not.toHaveBeenCalled();
  });

  it('a disconnected transport retries the existing binding without replacing its scene generation', () => {
    renderWrapper();
    expect(h.initializeCount.value).toBe(1);

    act(() => h.onReconnect.value?.());

    expect(h.reconnect).toHaveBeenCalledTimes(1);
    expect(h.cleanupCount.value).toBe(0);
    expect(h.initializeCount.value).toBe(1);
  });

  it('terminal edits-not-saved: data-loss copy, no reconnect (distinct from a deletion)', () => {
    renderWrapper();
    send({ code: 'edits-not-saved', scope: 'document', disposition: 'terminal' });
    expect(h.editorInvalidatedCount.value).toBe(0);
    expect(h.notifications).toContain('callout.whiteboard.session.editsNotSaved');
    expect(h.notifications).not.toContain('callout.whiteboard.session.documentDeleted');
  });

  it('terminal document-deleted: no reconnect, deletion copy', () => {
    renderWrapper();
    send({ code: 'document-deleted', scope: 'document', disposition: 'terminal' });
    expect(h.notifications).toContain('callout.whiteboard.session.documentDeleted');
  });

  it('invalidates the old editor before publishing the API for a new whiteboard id', () => {
    const view = renderWrapper();

    view.rerender(wrapper('wb-2'));

    expect(h.editorInvalidatedCount.value).toBe(1);
    expect(h.apiEvents).toEqual(['api:api-1', 'invalidate', 'api:api-2']);
    expect(h.publishedApi.value).toBe('api-2');
  });
});
