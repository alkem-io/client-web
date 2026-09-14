import { render } from '@testing-library/react';
import { toBase64 } from 'lib0/buffer';
import { Component, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { serializeWhiteboardContent } from './whiteboardContent';

/**
 * C1 — the single-user / preview seed must honor the FR-010 decode-with-fallback contract:
 * unreadable stored `content` (non-base64 OR a malformed-v2 buffer) yields an EMPTY editable
 * scene AND still fires `onSceneInitialized`, instead of throwing out of the seed effect (which
 * would unmount the editor subtree to a blank and skip edit-tracking start). The stub editor
 * models the REAL `applyRemoteSceneUpdate`, which throws on a malformed 'v2' update — so before
 * the fix a bad seed threw; after it the shared `decodeWhiteboardContentUpdate` owner returns
 * `null` for bad content and the apply is skipped. This is DISTINCT from the WS scene-sync frame
 * path (`unifiedCollabProvider.readSceneSyncMessage`), which is intentionally fail-loud.
 */
const h = vi.hoisted(() => ({
  applyCalls: [] as Uint8Array[],
  sceneInitCalls: 0,
}));

// Replace the lazy <Excalidraw> with a stub that hands back a mock imperative API on mount.
// Its `applyRemoteSceneUpdate` decodes the update via the real `decodeSnapshot`, so it THROWS on
// garbage bytes exactly like the real editor's `Y.applyUpdateV2` — making an unguarded seed fail.
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  const { decodeSnapshot } = await import('@excalidraw-yjs/excalidraw/headless');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => {
        props.onExcalidrawAPI?.({
          applyRemoteSceneUpdate: (update: Uint8Array) => {
            h.applyCalls.push(update);
            decodeSnapshot(update); // throws on a malformed update — faithful to the real editor
          },
          getSceneElements: () => [],
          scrollToContent: () => {},
          getFiles: () => ({}),
          refresh: () => {},
        });
      }, []);
      return null;
    },
    lazyImportWithErrorHandler: () => Promise.resolve({}),
    LazyLoadError: class extends Error {},
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/common/whiteboard/excalidraw/useWhiteboardDefaults', () => ({ default: () => ({}) }));

// Imported AFTER the mocks (vitest hoists vi.mock above imports).
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';

class ErrorBoundary extends Component<{ onError: (e: Error) => void; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Render the wrapper with the given stored content; returns any error the seed effect threw. */
function renderWithContent(content: string): Error[] {
  const errors: Error[] = [];
  render(
    <ErrorBoundary onError={e => errors.push(e)}>
      <ExcalidrawWrapper
        entities={{ whiteboard: { id: 'wb-1', content }, assetAdapter: {} as never }}
        actions={{
          onSceneInitialized: () => {
            h.sceneInitCalls += 1;
          },
        }}
      />
    </ErrorBoundary>
  );
  return errors;
}

describe('ExcalidrawWrapper — FR-010 seed decode-with-fallback (C1)', () => {
  beforeEach(() => {
    h.applyCalls = [];
    h.sceneInitCalls = 0;
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('non-base64 content renders an empty editable scene and still fires onSceneInitialized (no throw/blank)', () => {
    const errors = renderWithContent('!!not-base64!!');
    expect(errors).toHaveLength(0);
    expect(h.sceneInitCalls).toBe(1);
    // Unreadable content → the apply is skipped entirely (empty scene), never called with garbage.
    expect(h.applyCalls).toHaveLength(0);
  });

  it('a malformed-v2 buffer renders an empty editable scene and still fires onSceneInitialized (no throw/blank)', () => {
    const malformedV2 = toBase64(new Uint8Array([1, 2, 3, 4, 5]));
    const errors = renderWithContent(malformedV2);
    expect(errors).toHaveLength(0);
    expect(h.sceneInitCalls).toBe(1);
    expect(h.applyCalls).toHaveLength(0);
  });

  it('well-formed content seeds via applyRemoteSceneUpdate and fires onSceneInitialized (positive control)', () => {
    const content = serializeWhiteboardContent({
      elements: [{ id: 'r', type: 'rectangle', x: 0, y: 0, width: 10, height: 10, index: 'a0' }],
      assets: {},
      appState: {},
    } as never);
    const errors = renderWithContent(content);
    expect(errors).toHaveLength(0);
    expect(h.sceneInitCalls).toBe(1);
    // A readable snapshot IS applied to the live scene.
    expect(h.applyCalls).toHaveLength(1);
  });
});
