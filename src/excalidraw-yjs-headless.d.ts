// The client's tsconfig uses classic Node module resolution, which ignores package
// `exports` maps — so `tsc` cannot resolve the `@excalidraw-yjs/excalidraw/headless`
// subpath's types on its own (unlike Vite/Vitest, which read the exports map and load
// the real roughjs/UI-free headless entry at runtime). Importing the snapshot codec
// from `/headless` (rather than the package root) keeps unit tests + non-editor callers
// off the full editor bundle; this declaration only bridges the TYPE side, re-exporting
// the codec surface we consume from its classic-node-resolvable deep types path.
declare module '@excalidraw-yjs/excalidraw/headless' {
  export {
    decodeSnapshot,
    encodeSnapshot,
    type WhiteboardSnapshot,
  } from '@excalidraw-yjs/excalidraw/dist/types/element/src/yjs/schema';
}
