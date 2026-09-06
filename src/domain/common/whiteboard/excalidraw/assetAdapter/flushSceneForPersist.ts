import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { toBase64 } from 'lib0/buffer';

export type FlushSceneResult = { ok: true; content: string } | { ok: false; failedCount: number };

/**
 * The persistence/termination gate for whiteboard images. Flushes any pending
 * asset publication so every dropped image has a committed storage locator in the
 * scene, THEN encodes the live scene as a base64 Yjs-V2 update for storage.
 *
 * If any image failed to publish (`report.failed` non-empty), returns
 * `{ ok: false }` with NO content — the caller MUST NOT treat that as a successful
 * save/close (an image without a durable locator would be lost). This closes the
 * slow-upload race where a save/close fires while a `store` is still in flight.
 */
export async function flushAndEncodeScene(api: ExcalidrawImperativeAPI): Promise<FlushSceneResult> {
  const report = await api.flushAssetPublication();
  if (report.failed.length > 0) {
    return { ok: false, failedCount: report.failed.length };
  }
  return { ok: true, content: toBase64(api.encodeSceneStateAsUpdate('v2')) };
}
