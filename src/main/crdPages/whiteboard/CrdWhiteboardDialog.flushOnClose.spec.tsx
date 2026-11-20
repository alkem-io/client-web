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
  it('joins the durability owner, captures the preview, closes, then uploads in the background', async () => {
    const order: string[] = [];
    let finishUpload: (ok: boolean) => void = () => undefined;
    const result = await closeCollaborativeWhiteboard({
      requestDurability: async () => void order.push('durability'),
      capturePreview: async () => {
        order.push('capture');
        return () => {
          order.push('upload');
          return new Promise<boolean>(resolve => {
            finishUpload = resolve;
          });
        };
      },
      teardown: () => order.push('teardown'),
    });
    expect(result).toBe(true);
    expect(order).toEqual(['durability', 'capture', 'teardown', 'upload']);
    finishUpload(true);
  });

  it('waits for the upload before closing a draft, so an immediate publish copies the new visuals', async () => {
    const order: string[] = [];
    const result = await closeCollaborativeWhiteboard({
      requestDurability: async () => void order.push('durability'),
      requireDurability: true,
      capturePreview: async () => {
        order.push('capture');
        return async () => {
          await Promise.resolve();
          order.push('upload done');
          return true;
        };
      },
      teardown: () => order.push('teardown'),
    });
    expect(result).toBe(true);
    expect(order).toEqual(['durability', 'capture', 'upload done', 'teardown']);
  });

  it('still closes a draft when its upload fails, reporting the failure', async () => {
    const onMetadataFailed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        requestDurability: vi.fn(),
        requireDurability: true,
        capturePreview: async () => async () => false,
        onMetadataFailed,
        teardown,
      })
    ).resolves.toBe(true);
    expect(onMetadataFailed).toHaveBeenCalledOnce();
    expect(teardown).toHaveBeenCalledOnce();
  });

  it('closes without uploading when there is no preview work', async () => {
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        requestDurability: vi.fn(),
        capturePreview: async () => undefined,
        teardown,
      })
    ).resolves.toBe(true);
    expect(teardown).toHaveBeenCalledOnce();
  });

  it('reports a failed background upload after the dialog has closed', async () => {
    const metadataFailed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        requestDurability: vi.fn(),
        capturePreview: async () => async () => false,
        onMetadataFailed: metadataFailed,
        teardown,
      })
    ).resolves.toBe(true);
    expect(teardown).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(metadataFailed).toHaveBeenCalledOnce());
  });

  it('reports a rejected background upload', async () => {
    const metadataFailed = vi.fn();
    await closeCollaborativeWhiteboard({
      capturePreview: async () => () => Promise.reject(new Error('upload failed')),
      onMetadataFailed: metadataFailed,
      teardown: vi.fn(),
    });
    await vi.waitFor(() => expect(metadataFailed).toHaveBeenCalledOnce());
  });

  it('reports a failed capture and still closes', async () => {
    const metadataFailed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        capturePreview: async () => Promise.reject(new Error('export failed')),
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
    const capturePreview = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        capturePreview,
        requestDurability: async () => Promise.reject(new Error('offline')),
        onDurabilityFailed: failed,
        teardown,
      })
    ).resolves.toBe(false);
    expect(failed).toHaveBeenCalledOnce();
    expect(capturePreview).not.toHaveBeenCalled();
    expect(teardown).not.toHaveBeenCalled();
  });

  it('fails closed for a draft when no live durability owner exists', async () => {
    const failed = vi.fn();
    const teardown = vi.fn();
    await expect(
      closeCollaborativeWhiteboard({
        capturePreview: vi.fn(),
        requireDurability: true,
        onDurabilityFailed: failed,
        teardown,
      })
    ).resolves.toBe(false);
    expect(failed).toHaveBeenCalledOnce();
    expect(teardown).not.toHaveBeenCalled();
  });
});
