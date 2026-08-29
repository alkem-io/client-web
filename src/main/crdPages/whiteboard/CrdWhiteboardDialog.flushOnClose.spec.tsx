import { describe, expect, it, vi } from 'vitest';
import { closeCollaborativeWhiteboard } from './CrdWhiteboardDialog';

describe('closeCollaborativeWhiteboard', () => {
  it('saves metadata and joins the ordinary durability owner before teardown', async () => {
    const order: string[] = [];
    const result = await closeCollaborativeWhiteboard({
      save: async () => {
        order.push('metadata');
        return true;
      },
      requestDurability: async () => void order.push('durability'),
      teardown: () => order.push('teardown'),
    });
    expect(result).toBe(true);
    expect(order).toEqual(['metadata', 'durability', 'teardown']);
  });

  it('keeps the mounted editor open when metadata cannot be saved', async () => {
    const requestDurability = vi.fn();
    const teardown = vi.fn();
    await expect(closeCollaborativeWhiteboard({ save: async () => false, requestDurability, teardown })).resolves.toBe(
      false
    );
    expect(requestDurability).not.toHaveBeenCalled();
    expect(teardown).not.toHaveBeenCalled();
  });

  it('keeps the mounted editor open and reports a failed durability operation', async () => {
    const failed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        save: async () => true,
        requestDurability: async () => Promise.reject(new Error('offline')),
        onDurabilityFailed: failed,
        teardown,
      })
    ).resolves.toBe(false);
    expect(failed).toHaveBeenCalledOnce();
    expect(teardown).not.toHaveBeenCalled();
  });

  it('fails closed for a draft when no live durability owner exists', async () => {
    const failed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        save: async () => true,
        requireDurability: true,
        onDurabilityFailed: failed,
        teardown,
      })
    ).resolves.toBe(false);
    expect(failed).toHaveBeenCalledOnce();
    expect(teardown).not.toHaveBeenCalled();
  });
});
