import { viteStaticCopy } from 'vite-plugin-static-copy';

const ELEMENT_CALL_PACKAGE = 'node_modules/@element-hq/element-call-embedded';

/**
 * Files served under `/element-call/`: the unmodified Element Call build, its two licence texts,
 * the tracked call UI configuration and the page stating its licence and corresponding source.
 * Shared by every Vite config so the dev server, the development build and the release build
 * ship the same set.
 */
export const elementCallCopyTargets = [
  {
    src: `${ELEMENT_CALL_PACKAGE}/dist/**/*`,
    dest: 'element-call',
    // keep the package's own layout (index.html, assets/) below /element-call/
    rename: { stripBase: 4 },
  },
  { src: `${ELEMENT_CALL_PACKAGE}/LICENSE-AGPL-3.0`, dest: 'element-call', rename: { stripBase: 3 } },
  { src: `${ELEMENT_CALL_PACKAGE}/LICENSE-COMMERCIAL`, dest: 'element-call', rename: { stripBase: 3 } },
  { src: '.build/element-call/config.json', dest: 'element-call', rename: { stripBase: 2 } },
  { src: '.build/element-call/SOURCE.html', dest: 'element-call', rename: { stripBase: 2 } },
];

/**
 * The embedded call UI is served as static files beside the app, never bundled into it.
 * Whether calls are offered at all is decided at runtime by the LiveKit service URL setting.
 */
export const elementCallStaticCopy = () => viteStaticCopy({ targets: elementCallCopyTargets });
