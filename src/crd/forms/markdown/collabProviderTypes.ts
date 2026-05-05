/**
 * Opaque collaboration types for CRD markdown editor.
 *
 * These shapes keep `src/crd/` free of any `yjs` or `@hocuspocus/provider` imports
 * (runtime OR type). The integration layer under `src/main/crdPages/memo/` creates
 * real Y.Doc / Hocuspocus provider instances and casts them to these opaque shapes
 * at the boundary.
 */

export type YDocLike = { readonly __ydocBrand: unique symbol } & Record<string, unknown>;

export type CollabAwarenessLike = {
  setLocalStateField: (key: string, value: unknown) => void;
  getStates: () => Map<number, unknown>;
};

export type CollabStatus = 'connecting' | 'connected' | 'disconnected';

export type CollabProviderLike = {
  awareness: CollabAwarenessLike;
  status: CollabStatus;
  on(event: string, cb: (...args: unknown[]) => void): void;
  off(event: string, cb: (...args: unknown[]) => void): void;
  destroy(): void;
};
