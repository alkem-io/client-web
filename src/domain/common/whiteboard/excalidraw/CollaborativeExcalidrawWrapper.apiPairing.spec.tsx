import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * #7 — the init effect must NEVER pair the previous editor's api with the new
 * whiteboard's room. `<Excalidraw>` is keyed by whiteboard id, so an in-place id
 * change A→B remounts the editor, but `whiteboard.id` advances a render before
 * editor B mounts and hands back its api. For that one render `excalidrawApi` is
 * still editor A's while the room is already B — driving a provider for room B off
 * editor A's scene port would push scene A into room B.
 */
const h = vi.hoisted(() => ({
  mountCount: { value: 0 },
  initCalls: [] as Array<{ apiId: string; roomId: string }>,
  apiEvents: [] as Array<string | null>,
}));

// A distinct api per mount (`api-1`, `api-2`, …); keyed remount → a fresh api.
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => {
        h.mountCount.value += 1;
        const id = `api-${h.mountCount.value}`;
        props.onExcalidrawAPI?.({ id, encodeSceneStateVector: () => id });
        return () => props.onExcalidrawAPI?.(null);
      }, []);
      return null;
    },
  };
});

vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', () => ({
  UnifiedCollabProvider: class {
    state = { kind: 'loading' };
    readOnlyReason = undefined;
    hasUnsavedChanges = false;
    hasChangesAtRisk = false;
    awareness = {};
    ephemeralChannel = {};
    constructor(opts: { documentId: string; scenePort: { encodeSceneStateVector: () => string } }) {
      h.initCalls.push({ apiId: opts.scenePort.encodeSceneStateVector(), roomId: opts.documentId });
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
    setUser: vi.fn(),
    fitScene: vi.fn(),
    destroy: vi.fn(),
    onPointerUpdate: vi.fn(),
    broadcastEmojiReaction: vi.fn(),
    broadcastCountdownTimer: vi.fn(),
  }),
}));

vi.mock('./useWhiteboardDefaults', () => ({ default: () => ({}) }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: 'Tester' } } }),
}));
vi.mock('@/domain/shared/utils/useCombinedRefs', () => ({ useCombinedRefs: () => ({ current: null }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const wrapper = (whiteboardId?: string) => (
  <CollaborativeExcalidrawWrapper
    entities={{
      whiteboard: whiteboardId ? { id: whiteboardId } : undefined,
      assetAdapter: {} as never,
      lastSuccessfulSavedDate: undefined,
    }}
    options={{}}
    actions={{ onInitApi: api => h.apiEvents.push((api as { id?: string } | null)?.id ?? null) }}
  >
    {({ children }) => <>{children}</>}
  </CollaborativeExcalidrawWrapper>
);

const renderWrapper = (whiteboardId: string) => render(wrapper(whiteboardId));

describe('CollaborativeExcalidrawWrapper — api ↔ whiteboard-id pairing', () => {
  beforeEach(() => {
    h.mountCount.value = 0;
    h.initCalls.length = 0;
    h.apiEvents.length = 0;
  });
  afterEach(() => vi.clearAllMocks());

  it('never initializes a room with the PREVIOUS editor api on an in-place whiteboard.id change', () => {
    const { rerender } = renderWrapper('wb-A');
    // Editor A mounted and initialized its own room.
    expect(h.initCalls).toContainEqual({ apiId: 'api-1', roomId: 'wb-A' });

    // The whiteboard id changes in place; the editor remounts (keyed) and hands back api-2.
    rerender(wrapper('wb-B'));

    // The load-bearing invariant: room B is NEVER initialized with editor A's api.
    expect(h.initCalls).not.toContainEqual({ apiId: 'api-1', roomId: 'wb-B' });
    // Room B is initialized only by the editor that mounted under it.
    expect(h.initCalls).toContainEqual({ apiId: 'api-2', roomId: 'wb-B' });
  });

  it('forwards editor disposal and never retains an api across a same-id remount', () => {
    const { rerender } = renderWrapper('wb-A');
    expect(h.apiEvents).toEqual(['api-1']);

    rerender(wrapper());
    expect(h.apiEvents).toEqual(['api-1', null]);

    rerender(wrapper('wb-A'));
    expect(h.apiEvents).toEqual(['api-1', null, 'api-2']);
    expect(h.initCalls.filter(call => call.roomId === 'wb-A')).toEqual([
      { apiId: 'api-1', roomId: 'wb-A' },
      { apiId: 'api-2', roomId: 'wb-A' },
    ]);
  });
});
