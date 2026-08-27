import { describe, expect, it, vi } from 'vitest';
import { prepareWhiteboardDraftsForCalloutCreation, runCalloutCreationOnce } from './CalloutFormConnector';

const deferred = () => {
  let resolve!: (prepared: boolean) => void;
  const promise = new Promise<boolean>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('prepareWhiteboardDraftsForCalloutCreation', () => {
  it('waits for both framing and response whiteboards before the caller can create the callout', async () => {
    const framing = deferred();
    const response = deferred();
    const prepareFraming = vi.fn(() => framing.promise);
    const prepareResponse = vi.fn(() => response.promise);
    const createCallout = vi.fn();

    const submit = (async () => {
      const prepared = await prepareWhiteboardDraftsForCalloutCreation([
        { prepareForConsumption: prepareFraming },
        { prepareForConsumption: prepareResponse },
      ]);
      if (prepared) createCallout();
      return prepared;
    })();

    framing.resolve(true);
    await Promise.resolve();
    expect(createCallout).not.toHaveBeenCalled();

    response.resolve(true);
    await expect(submit).resolves.toBe(true);
    expect(createCallout).toHaveBeenCalledOnce();
  });

  it('blocks creation when either draft is not durable and leaves cleanup to the retry path', async () => {
    const createCallout = vi.fn();
    const consumed = vi.fn();

    const prepared = await prepareWhiteboardDraftsForCalloutCreation([
      { prepareForConsumption: vi.fn(async () => true) },
      { prepareForConsumption: vi.fn(async () => false) },
    ]);
    if (prepared) {
      createCallout();
      consumed();
    }

    expect(prepared).toBe(false);
    expect(createCallout).not.toHaveBeenCalled();
    expect(consumed).not.toHaveBeenCalled();
  });

  it('keeps the entire preparation and create operation single-flight', async () => {
    const inFlight = { current: false };
    const preparation = deferred();
    const create = vi.fn(async () => {
      await preparation.promise;
    });
    const setPreparing = vi.fn();

    const first = runCalloutCreationOnce(inFlight, setPreparing, create);
    const second = runCalloutCreationOnce(inFlight, setPreparing, create);

    expect(create).toHaveBeenCalledOnce();
    expect(setPreparing).toHaveBeenCalledWith(true);
    await expect(second).resolves.toBeUndefined();

    preparation.resolve(true);
    await first;

    expect(setPreparing).toHaveBeenLastCalledWith(false);
    expect(inFlight.current).toBe(false);
  });
});
