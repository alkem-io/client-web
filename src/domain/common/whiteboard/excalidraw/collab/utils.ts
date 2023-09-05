import { ExcalidrawElement, ExcalidrawImageElement, InitializedExcalidrawImageElement } from '@alkemio/excalidraw/types/element/types';
import { unstable_batchedUpdates } from 'react-dom';

export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  timeout: number,
) => {
  let handle = 0;
  let lastArgs: T | null = null;
  const ret = (...args: T) => {
    lastArgs = args;
    clearTimeout(handle);
    handle = window.setTimeout(() => {
      lastArgs = null;
      fn(...args);
    }, timeout);
  };
  ret.flush = () => {
    clearTimeout(handle);
    if (lastArgs) {
      const _lastArgs = lastArgs;
      lastArgs = null;
      fn(..._lastArgs);
    }
  };
  ret.cancel = () => {
    lastArgs = null;
    clearTimeout(handle);
  };
  return ret;
};

export const arrayToMapWithIndex = <T extends { id: string }>(
  elements: readonly T[],
) =>
  elements.reduce((acc, element: T, idx) => {
    acc.set(element.id, [element, idx]);
    return acc;
  }, new Map<string, [element: T, index: number]>());

  export const preventUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    // NOTE: modern browsers no longer allow showing a custom message here
    event.returnValue = '';
  };

export const bytesToHexString = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map((byte) => `0${byte.toString(16)}`.slice(-2))
    .join('');
};

export type ResolvablePromise<T> = Promise<T> & {
  resolve: [T] extends [undefined] ? (value?: T) => void : (value: T) => void;
  reject: (error: Error) => void;
};

export const resolvablePromise = <T>() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let resolve!: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject!: any;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (promise as any).resolve = resolve;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (promise as any).reject = reject;
  return promise as ResolvablePromise<T>;
};

/**
 * @param func handler taking at most single parameter (event).
 */
export const withBatchedUpdates = <
  TFunction extends ((event) => void) | (() => void),
>(
  func: Parameters<TFunction>['length'] extends 0 | 1 ? TFunction : never,
) =>
  ((event) => {
    unstable_batchedUpdates(func as TFunction, event);
  }) as TFunction;

export const isImageElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawImageElement => {
  return !!element && element.type === 'image';
};

export const isInitializedImageElement = (
  element: ExcalidrawElement | null,
): element is InitializedExcalidrawImageElement => {
  return !!element && element.type === 'image' && !!element.fileId;
};

export enum UserIdleState {
  ACTIVE = 'active',
  AWAY = 'away',
  IDLE = 'idle',
}