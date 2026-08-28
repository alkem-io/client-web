import { describe, expect, it, vi } from 'vitest';
import { importWhiteboardTemplate, WhiteboardTemplatePersistenceUnconfirmedError } from './importWhiteboardTemplate';

describe('importWhiteboardTemplate', () => {
  it('merges exactly once and reports no success until target persistence is confirmed', async () => {
    let confirmPersistence: (() => void) | undefined;
    const requestDurability = vi.fn(
      () =>
        new Promise<void>(resolve => {
          confirmPersistence = resolve;
        })
    );
    const merge = vi.fn(async () => {});
    const operation = importWhiteboardTemplate({
      load: async () => ({ elements: ['one'] }),
      merge,
      requestDurability,
      isCancelled: () => false,
    });

    let settled = false;
    void operation.then(() => {
      settled = true;
    });
    await vi.waitFor(() => expect(requestDurability).toHaveBeenCalledTimes(1));
    expect(merge).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);

    confirmPersistence?.();
    await expect(operation).resolves.toBeUndefined();
    expect(merge).toHaveBeenCalledTimes(1);
  });

  it('does not rerun an applied merge when target persistence fails', async () => {
    const merge = vi.fn(async () => {});
    const operation = importWhiteboardTemplate({
      load: async () => ({ elements: ['one'] }),
      merge,
      requestDurability: async () => {
        throw new Error('deadline');
      },
      isCancelled: () => false,
    });

    await expect(operation).rejects.toBeInstanceOf(WhiteboardTemplatePersistenceUnconfirmedError);
    expect(merge).toHaveBeenCalledTimes(1);
  });

  it('still requires target persistence if cancellation arrives after the additive merge starts', async () => {
    let cancelled = false;
    const requestDurability = vi.fn(async () => {
      throw new Error('target closed');
    });
    const operation = importWhiteboardTemplate({
      load: async () => ({ elements: ['one'] }),
      merge: async () => {
        cancelled = true;
      },
      requestDurability,
      isCancelled: () => cancelled,
    });

    await expect(operation).rejects.toBeInstanceOf(WhiteboardTemplatePersistenceUnconfirmedError);
    expect(requestDurability).toHaveBeenCalledOnce();
  });

  it('applies the same template twice when the user performs two separate import actions', async () => {
    const merge = vi.fn(async () => {});
    const oneAction = () =>
      importWhiteboardTemplate({
        load: async () => ({ elements: ['one'] }),
        merge,
        requestDurability: async () => {},
        isCancelled: () => false,
      });

    await oneAction();
    await oneAction();
    expect(merge).toHaveBeenCalledTimes(2);
  });
});
