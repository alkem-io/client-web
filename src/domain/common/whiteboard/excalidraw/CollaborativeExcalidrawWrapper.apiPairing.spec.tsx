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
}));

// A distinct api per mount (`api-1`, `api-2`, …); keyed remount → a fresh api.
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

// Capture every initializeCollab call as (api id, roomId).
vi.mock('./collab/useCollab', () => ({
  default: () => [
    null,
    (opts: { excalidrawApi: { id: string }; roomId: string }) => {
      h.initCalls.push({ apiId: opts.excalidrawApi.id, roomId: opts.roomId });
      return () => {};
    },
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
  ],
}));

vi.mock('./useWhiteboardDefaults', () => ({ default: () => ({}) }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: 'Tester' } } }),
}));
vi.mock('@/domain/shared/utils/useCombinedRefs', () => ({ useCombinedRefs: () => ({ current: null }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const renderWrapper = (whiteboardId: string) =>
  render(
    <CollaborativeExcalidrawWrapper
      entities={{ whiteboard: { id: whiteboardId }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
      options={{}}
      actions={{}}
      renderDisconnectNotice={() => null}
    >
      {({ children }) => <>{children}</>}
    </CollaborativeExcalidrawWrapper>
  );

describe('CollaborativeExcalidrawWrapper — api ↔ whiteboard-id pairing', () => {
  beforeEach(() => {
    h.mountCount.value = 0;
    h.initCalls.length = 0;
  });
  afterEach(() => vi.clearAllMocks());

  it('never initializes a room with the PREVIOUS editor api on an in-place whiteboard.id change', () => {
    const { rerender } = renderWrapper('wb-A');
    // Editor A mounted and initialized its own room.
    expect(h.initCalls).toContainEqual({ apiId: 'api-1', roomId: 'wb-A' });

    // The whiteboard id changes in place; the editor remounts (keyed) and hands back api-2.
    rerender(
      <CollaborativeExcalidrawWrapper
        entities={{ whiteboard: { id: 'wb-B' }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
        options={{}}
        actions={{}}
        renderDisconnectNotice={() => null}
      >
        {({ children }) => <>{children}</>}
      </CollaborativeExcalidrawWrapper>
    );

    // The load-bearing invariant: room B is NEVER initialized with editor A's api.
    expect(h.initCalls).not.toContainEqual({ apiId: 'api-1', roomId: 'wb-B' });
    // Room B is initialized only by the editor that mounted under it.
    expect(h.initCalls).toContainEqual({ apiId: 'api-2', roomId: 'wb-B' });
  });
});
