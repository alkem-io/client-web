import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionEndInfo } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * #3 — the wrapper's session-end outcomes. useCollab is mocked to capture the `onSessionEnd`
 * callback the wrapper hands it (so a session-end can be driven without a socket) and
 * useAutoReconnect is mocked to capture the `active` flag + the `onReconnect` (the wrapper's
 * restartCollaboration). The <Excalidraw> is a mount-counter so a fresh generation is visible.
 */
const h = vi.hoisted(() => ({
  onSessionEnd: { value: undefined as ((info: SessionEndInfo) => void) | undefined },
  onReconnect: { value: undefined as (() => void) | undefined },
  autoReconnectActive: [] as boolean[],
  notifications: [] as string[],
  mountCount: { value: 0 },
  editorInvalidatedCount: { value: 0 },
  publishedApi: { value: null as string | null },
  apiEvents: [] as string[],
}));

vi.mock('./collab/useCollab', () => ({
  default: (opts: { onSessionEnd?: (info: SessionEndInfo) => void }) => {
    h.onSessionEnd.value = opts.onSessionEnd;
    return [
      null,
      () => () => {},
      { connecting: false, collaborating: false, mode: null, modeReason: null, isReadOnly: false },
    ];
  },
}));
vi.mock('./useAutoReconnect', () => ({
  useAutoReconnect: (params: { active: boolean; onReconnect: () => void }) => {
    h.autoReconnectActive.push(params.active);
    h.onReconnect.value = params.onReconnect;
    return { secondsRemaining: null };
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
    renderDisconnectNotice={() => null}
  >
    {({ children }) => <>{children}</>}
  </CollaborativeExcalidrawWrapper>
);

const renderWrapper = () => render(wrapper());

const lastActive = () => h.autoReconnectActive[h.autoReconnectActive.length - 1];
const send = (info: SessionEndInfo) => act(() => h.onSessionEnd.value?.(info));

describe('CollaborativeExcalidrawWrapper — session-end outcomes', () => {
  beforeEach(() => {
    h.onSessionEnd.value = undefined;
    h.onReconnect.value = undefined;
    h.autoReconnectActive.length = 0;
    h.notifications.length = 0;
    h.mountCount.value = 0;
    h.editorInvalidatedCount.value = 0;
    h.publishedApi.value = null;
    h.apiEvents.length = 0;
  });
  afterEach(() => vi.clearAllMocks());

  it('transient: informational only — no discard, no retry-notice arming (no second reconnect trigger)', () => {
    renderWrapper();
    send({ code: 'update-rate-exceeded', scope: 'member', disposition: 'transient' });
    expect(h.editorInvalidatedCount.value).toBe(0); // nothing discarded
    expect(lastActive()).toBe(false); // notice not opened → useAutoReconnect NOT armed (provider reconnects)
    expect(h.notifications).toContain('callout.whiteboard.session.rateExceeded');
  });

  it('transient update-not-accepted: reconnect notice only — no discard, no retry-notice arming', () => {
    renderWrapper();
    send({ code: 'update-not-accepted', scope: 'member', disposition: 'transient' });
    expect(h.editorInvalidatedCount.value).toBe(0); // nothing discarded
    expect(lastActive()).toBe(false); // notice not opened → useAutoReconnect NOT armed (provider reconnects)
    expect(h.notifications).toContain('callout.whiteboard.session.updateNotAccepted');
  });

  it('transient server shutdown preserves the editor generation', () => {
    renderWrapper();
    send({ code: 'server-shutdown', scope: 'document', disposition: 'transient' });
    expect(h.editorInvalidatedCount.value).toBe(0);
    expect(lastActive()).toBe(false);
    expect(h.notifications).toContain('callout.whiteboard.session.serverShutdown');
  });

  it('manual (size-limit): discards the generation + disables auto-reconnect; the restart mints a fresh generation', () => {
    renderWrapper();
    const mountsBefore = h.mountCount.value;
    send({ code: 'document-size-limit-exceeded', scope: 'member', disposition: 'manual' });
    expect(h.editorInvalidatedCount.value).toBe(1); // poisoned generation torn down
    expect(lastActive()).toBe(false); // both loops off
    expect(h.notifications).toContain('callout.whiteboard.session.sizeLimitExceeded');
    // The explicit user restart mints a FRESH generation (remount) before reconnecting.
    act(() => h.onReconnect.value?.());
    expect(h.mountCount.value).toBeGreaterThan(mountsBefore);
  });

  it('terminal edits-not-saved: data-loss copy, no reconnect (distinct from a deletion)', () => {
    renderWrapper();
    send({ code: 'edits-not-saved', scope: 'document', disposition: 'terminal' });
    expect(lastActive()).toBe(false); // no auto-reconnect
    expect(h.editorInvalidatedCount.value).toBe(0);
    expect(h.notifications).toContain('callout.whiteboard.session.editsNotSaved');
    expect(h.notifications).not.toContain('callout.whiteboard.session.documentDeleted');
  });

  it('terminal document-deleted: no reconnect, deletion copy', () => {
    renderWrapper();
    send({ code: 'document-deleted', scope: 'document', disposition: 'terminal' });
    expect(lastActive()).toBe(false);
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
