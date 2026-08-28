import type { AssetPublishReport } from '@excalidraw-yjs/excalidraw/types';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Captured props of the (mocked) <Excalidraw> element rendered by the wrapper.
// `vi.hoisted` so the mock factory below — which is hoisted above imports — can
// reference it without the classic "used before declaration" trap.
const h = vi.hoisted(() => ({ excalidrawProps: null as Record<string, unknown> | null }));

// The wrapper builds its <Excalidraw> via lazyWithGlobalErrorHandler. Replace it
// with a synchronous prop-capturing component so the render is deterministic (no
// dynamic import, no Suspense delay, no CSS side effects). Keep the other named
// exports the module graph imports (mergeWhiteboard uses lazyImportWithErrorHandler).
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', () => ({
  lazyWithGlobalErrorHandler: () => (props: Record<string, unknown>) => {
    h.excalidrawProps = props;
    return null;
  },
  lazyImportWithErrorHandler: () => Promise.resolve({}),
  LazyLoadError: class extends Error {},
}));

// Mergewhiteboard statically imports the (heavy, browser-only) editor package;
// stub the handful of runtime exports the module graph touches at import time.
vi.mock('@excalidraw-yjs/excalidraw', () => ({
  Excalidraw: () => null,
  // `encodeSnapshot` must return real bytes: EmptyWhiteboard serializes an empty
  // snapshot at module load (toBase64 over a Uint8Array).
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
vi.mock('@/domain/common/whiteboard/excalidraw/collab/useCollab', () => ({
  default: () => [
    null,
    () => () => {},
    {
      state: { status: 'ready' },
      connecting: false,
      collaborating: true,
      mode: 'read',
      modeReason: undefined,
      isReadOnly: false,
    },
  ],
}));

// Imported AFTER the mocks are declared (vitest hoists vi.mock above imports).
import CollaborativeExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import { closeCollaborativeWhiteboard, saveWhiteboardDisplayName } from './CrdWhiteboardDialog';

const cleanReport: AssetPublishReport = { published: ['f1' as never], skipped: [], failed: [] };
const failedReport: AssetPublishReport = {
  published: [],
  skipped: [],
  failed: [{ fileId: 'f1' as never, error: new Error('store failed') }],
};

const deferredReport = () => {
  let resolveWith!: (r: AssetPublishReport) => void;
  const promise = new Promise<AssetPublishReport>(resolve => {
    resolveWith = resolve;
  });
  return { promise, resolveWith };
};

describe('closeCollaborativeWhiteboard — flush-at-collaborative-close gate', () => {
  it('(a) a clean flush report proceeds: flush is awaited BEFORE save + teardown', async () => {
    const order: string[] = [];
    const { promise, resolveWith } = deferredReport();
    const excalidrawAPI = {
      flushAssetPublication: vi.fn(() => {
        order.push('flush');
        return promise;
      }),
    };
    const save = vi.fn(async () => {
      order.push('save');
    });
    const teardown = vi.fn(() => {
      order.push('teardown');
    });
    const onPublishFailed = vi.fn();

    const closing = closeCollaborativeWhiteboard({ excalidrawAPI, save, onPublishFailed, teardown });

    // Flush is still pending — the provider/socket teardown must NOT have fired yet.
    await Promise.resolve();
    expect(teardown).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();

    resolveWith(cleanReport);
    const proceeded = await closing;

    expect(proceeded).toBe(true);
    expect(excalidrawAPI.flushAssetPublication).toHaveBeenCalledOnce();
    expect(onPublishFailed).not.toHaveBeenCalled();
    // Order proves the flush is awaited before the close/teardown callback.
    expect(order).toEqual(['flush', 'save', 'teardown']);
  });

  it('keeps a draft editor open when no durability barrier is available', async () => {
    const save = vi.fn(async () => {});
    const teardown = vi.fn();
    const onDurabilityFailed = vi.fn();

    const closed = await closeCollaborativeWhiteboard({
      excalidrawAPI: { flushAssetPublication: vi.fn(async () => cleanReport) },
      requireDurability: true,
      save,
      onPublishFailed: vi.fn(),
      onDurabilityFailed,
      teardown,
    });

    expect(closed).toBe(false);
    expect(onDurabilityFailed).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
    expect(teardown).not.toHaveBeenCalled();
  });

  it('keeps the editor open when persistence fails', async () => {
    const save = vi.fn(async () => {});
    const teardown = vi.fn();
    const onDurabilityFailed = vi.fn();

    const closed = await closeCollaborativeWhiteboard({
      excalidrawAPI: { flushAssetPublication: vi.fn(async () => cleanReport) },
      requestDurability: vi.fn(async () => {
        throw new Error('persist failed');
      }),
      requireDurability: true,
      save,
      onPublishFailed: vi.fn(),
      onDurabilityFailed,
      teardown,
    });

    expect(closed).toBe(false);
    expect(onDurabilityFailed).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
    expect(teardown).not.toHaveBeenCalled();
  });

  it('(b) a still-pending slow store that resolves with a non-empty `failed` does NOT report a clean close', async () => {
    const { promise, resolveWith } = deferredReport();
    const excalidrawAPI = { flushAssetPublication: vi.fn(() => promise) };
    const save = vi.fn(async () => {});
    const teardown = vi.fn();
    const onPublishFailed = vi.fn();

    const closing = closeCollaborativeWhiteboard({ excalidrawAPI, save, onPublishFailed, teardown });

    // While the store is still in flight nothing tears down.
    await Promise.resolve();
    expect(teardown).not.toHaveBeenCalled();

    // The flush finally resolves reporting a failed publish.
    resolveWith(failedReport);
    const proceeded = await closing;

    expect(proceeded).toBe(false); // blocked — not a successful close
    expect(onPublishFailed).toHaveBeenCalledOnce();
    expect(onPublishFailed).toHaveBeenCalledWith(failedReport);
    expect(save).not.toHaveBeenCalled(); // no save on a failed publish
    expect(teardown).not.toHaveBeenCalled(); // session stays up
  });

  it('(gate 5) a TIMED-OUT store surfaces in `failed` and blocks the close (no save, no teardown)', async () => {
    // Composition boundary: the adapter's `store` rejects with the upload-timeout
    // error on a hung upload (unit-proven in useWhiteboardAssetAdapter.spec — gates
    // 1-4,6). The fork's `flushAssetPublication` catches that rejection into
    // `report.failed` (fork-owned; stubbed here as the exact report it would emit).
    // This asserts the CLIENT close gate: given such a failed report, the close is
    // blocked — collaborative session stays up, nothing saves, nothing tears down,
    // so the local bytes remain available for a later retry.
    const timedOutReport: AssetPublishReport = {
      published: [],
      skipped: [],
      failed: [{ fileId: 'f1' as never, error: new Error('Image upload timed out') }],
    };
    const excalidrawAPI = { flushAssetPublication: vi.fn(async () => timedOutReport) };
    const save = vi.fn(async () => {});
    const teardown = vi.fn();
    const onPublishFailed = vi.fn();

    const proceeded = await closeCollaborativeWhiteboard({ excalidrawAPI, save, onPublishFailed, teardown });

    expect(proceeded).toBe(false);
    expect(onPublishFailed).toHaveBeenCalledWith(timedOutReport);
    expect(save).not.toHaveBeenCalled();
    expect(teardown).not.toHaveBeenCalled();
  });

  it('treats a missing (unmounted) editor as nothing-to-flush and proceeds', async () => {
    const save = vi.fn(async () => {});
    const teardown = vi.fn();
    const onPublishFailed = vi.fn();

    const proceeded = await closeCollaborativeWhiteboard({ excalidrawAPI: null, save, onPublishFailed, teardown });

    expect(proceeded).toBe(true);
    expect(save).toHaveBeenCalledOnce();
    expect(teardown).toHaveBeenCalledOnce();
    expect(onPublishFailed).not.toHaveBeenCalled();
  });
});

describe('saveWhiteboardDisplayName', () => {
  it('restores the canonical title and never logs rejected GraphQL variables or snapshot content', async () => {
    const rejectedValue = 'secret snapshot payload';
    const rename = vi.fn().mockRejectedValue(new Error(`variables=${rejectedValue}`));
    const restore = vi.fn(async () => undefined);
    const notifyFailure = vi.fn();

    await saveWhiteboardDisplayName({
      whiteboardId: 'wb-1',
      displayName: rejectedValue,
      canonicalDisplayName: 'Canonical title',
      rename,
      restore,
      notifyFailure,
    });

    expect(restore).toHaveBeenCalledWith('Canonical title');
    expect(notifyFailure).toHaveBeenCalledOnce();
    expect(rename).toHaveBeenCalledWith('wb-1', rejectedValue);
    const { error } = await import('@/core/logging/sentry/log');
    expect(error).toHaveBeenCalledWith(new Error('Whiteboard rename failed'), {
      category: 'whiteboard',
    });
    expect(JSON.stringify(vi.mocked(error).mock.calls)).not.toContain(rejectedValue);
  });
});

describe('CollaborativeExcalidrawWrapper — asset adapter wiring', () => {
  beforeEach(() => {
    h.excalidrawProps = null;
  });

  it('(c) passes the assetAdapter straight through to <Excalidraw>', async () => {
    const assetAdapter = { store: vi.fn(), resolve: vi.fn() } as never;

    render(
      <CollaborativeExcalidrawWrapper
        entities={{
          whiteboard: { id: 'wb-1', profile: { url: '/wb-1' } },
          assetAdapter,
          lastSuccessfulSavedDate: undefined,
        }}
        options={{} as never}
        actions={{}}
      >
        {({ children }) => children}
      </CollaborativeExcalidrawWrapper>
    );

    await waitFor(() => expect(h.excalidrawProps).not.toBeNull());
    expect(h.excalidrawProps?.assetAdapter).toBe(assetAdapter);
  });
});
