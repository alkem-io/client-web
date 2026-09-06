import type { WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import { serializeWhiteboardContent } from './excalidraw/whiteboardContent';

/** An empty whiteboard snapshot (`{ elements, assets, appState }`). */
export const EmptyWhiteboardSnapshot: WhiteboardSnapshot = {
  elements: [],
  assets: {},
  appState: { viewBackgroundColor: '#ffffff' },
};

/**
 * The default whiteboard `content` for a new callout / template / response default:
 * a base64-encoded Yjs-V2 snapshot of an empty scene (006 boundary — content is a
 * Yjs-V2 snapshot, NOT Excalidraw JSON; the server rejects JSON with error 12101).
 */
export const EmptyWhiteboardString: string = serializeWhiteboardContent(EmptyWhiteboardSnapshot);
