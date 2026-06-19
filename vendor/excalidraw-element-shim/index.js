// Minimal runtime stand-in for `@excalidraw/element` (see package.json).
//
// `@alkemio/excalidraw-yjs-binding` imports exactly one runtime value from
// `@excalidraw/element` — the `CaptureUpdateAction` enum (apply.ts). That package
// is an internal Excalidraw monorepo workspace package and is NOT published to a
// resolvable registry, so we provide the enum here verbatim instead of aliasing
// to the full `@alkemio/excalidraw` editor bundle (whose transitive `open-color`
// JSON import is rejected by Vitest's ESM loader).
//
// Source of truth: excalidraw-fork `packages/element/src/store.ts`
// (`export const CaptureUpdateAction`). Keep in sync if upstream changes it.
export const CaptureUpdateAction = {
  IMMEDIATELY: 'IMMEDIATELY',
  NEVER: 'NEVER',
  EVENTUALLY: 'EVENTUALLY',
};
