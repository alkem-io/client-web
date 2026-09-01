import { describe, expect, it, vi } from 'vitest';
import { acceptWhiteboardCloseIntent, closeCollaborativeWhiteboard } from './CrdWhiteboardDialog';

describe('acceptWhiteboardCloseIntent', () => {
  it('leaves an in-flight import running when unsaved changes block the close', () => {
    const abortImport = vi.fn();

    expect(acceptWhiteboardCloseIntent({ hasUnsaved: true, canPersist: false, abortImport })).toBe(false);
    expect(abortImport).not.toHaveBeenCalled();
  });

  it('accepts a clean close when persistence is unavailable', () => {
    const abortImport = vi.fn();

    expect(acceptWhiteboardCloseIntent({ hasUnsaved: false, canPersist: false, abortImport })).toBe(true);
    expect(abortImport).toHaveBeenCalledOnce();
  });

  it('aborts an in-flight import once the close is accepted', () => {
    const abortImport = vi.fn();

    expect(acceptWhiteboardCloseIntent({ hasUnsaved: true, canPersist: true, abortImport })).toBe(true);
    expect(abortImport).toHaveBeenCalledOnce();
  });
});

describe('closeCollaborativeWhiteboard', () => {
  it('joins the ordinary durability owner before best-effort metadata and teardown', async () => {
    const order: string[] = [];
    const result = await closeCollaborativeWhiteboard({
      hadLocalEdits: true,
      saveMetadata: async () => {
        order.push('metadata');
        return true;
      },
      requestDurability: async () => void order.push('durability'),
      teardown: () => order.push('teardown'),
    });
    expect(result).toBe(true);
    expect(order).toEqual(['durability', 'metadata', 'teardown']);
  });

  it('skips preview and metadata work for a look-only writer session', async () => {
    const saveMetadata = vi.fn();
    const teardown = vi.fn();

    await expect(
      closeCollaborativeWhiteboard({
        hadLocalEdits: false,
        saveMetadata,
        requestDurability: vi.fn(),
        teardown,
      })
    ).resolves.toBe(true);

    expect(saveMetadata).not.toHaveBeenCalled();
    expect(teardown).toHaveBeenCalledOnce();
  });

  it('reports a metadata failure and closes after content durability succeeds', async () => {
    const metadataFailed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        hadLocalEdits: true,
        saveMetadata: async () => false,
        requestDurability: vi.fn(),
        onMetadataFailed: metadataFailed,
        teardown,
      })
    ).resolves.toBe(true);
    expect(metadataFailed).toHaveBeenCalledOnce();
    expect(teardown).toHaveBeenCalledOnce();
  });

  it('reports a thrown metadata failure and still closes', async () => {
    const metadataFailed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        hadLocalEdits: true,
        saveMetadata: async () => Promise.reject(new Error('metadata unavailable')),
        onMetadataFailed: metadataFailed,
        teardown,
      })
    ).resolves.toBe(true);
    expect(metadataFailed).toHaveBeenCalledOnce();
    expect(teardown).toHaveBeenCalledOnce();
  });

  it('keeps the mounted editor open and reports a failed durability operation', async () => {
    const failed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        hadLocalEdits: true,
        saveMetadata: async () => true,
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
        hadLocalEdits: true,
        saveMetadata: async () => true,
        requireDurability: true,
        onDurabilityFailed: failed,
        teardown,
      })
    ).resolves.toBe(false);
    expect(failed).toHaveBeenCalledOnce();
    expect(teardown).not.toHaveBeenCalled();
  });
});
