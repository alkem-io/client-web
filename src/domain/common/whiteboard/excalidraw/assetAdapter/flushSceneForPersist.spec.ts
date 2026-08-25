import { describe, expect, it, vi } from 'vitest';
import { flushAndEncodeScene } from './flushSceneForPersist';

const makeApi = (
  report: { published: string[]; skipped: unknown[]; failed: Array<{ fileId: string; error: unknown }> },
  encoded = new Uint8Array([1, 2, 3])
) => ({
  flushAssetPublication: vi.fn(async () => report),
  encodeSceneStateAsUpdate: vi.fn(() => encoded),
});

describe('flushAndEncodeScene', () => {
  it('flushes then encodes the scene as a V2 update on a clean publish', async () => {
    const api = makeApi({ published: ['f1'], skipped: [], failed: [] });
    const result = await flushAndEncodeScene(api as never);

    expect(api.flushAssetPublication).toHaveBeenCalledTimes(1);
    expect(api.encodeSceneStateAsUpdate).toHaveBeenCalledWith('v2');
    expect(result).toEqual({ ok: true, content: expect.any(String) });
  });

  it('does NOT encode/persist when a store failed to publish (slow-store save/close race)', async () => {
    const api = makeApi({ published: [], skipped: [], failed: [{ fileId: 'f1', error: 'x' }] });
    const result = await flushAndEncodeScene(api as never);

    expect(api.flushAssetPublication).toHaveBeenCalledTimes(1);
    expect(api.encodeSceneStateAsUpdate).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, failedCount: 1 });
  });

  it('flushes BEFORE encoding so the persisted doc carries the committed locators', async () => {
    const order: string[] = [];
    const api = {
      flushAssetPublication: vi.fn(async () => {
        order.push('flush');
        return { published: [], skipped: [], failed: [] };
      }),
      encodeSceneStateAsUpdate: vi.fn(() => {
        order.push('encode');
        return new Uint8Array([1]);
      }),
    };
    await flushAndEncodeScene(api as never);
    expect(order).toEqual(['flush', 'encode']);
  });
});
