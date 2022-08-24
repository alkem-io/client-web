import { useEffect, useMemo, useRef } from 'react';

interface Checker {
  <Result>(promise: Promise<Result> | Result): Promise<Result>;
}

interface Callback<Args extends unknown[], Result> {
  (...args: Args): Promise<Result> | Result;
}

const interruption = Symbol('Unmounted');

/**
 * Creates and returns a callback by executing a callback factory. The 1st and only argument to the factory
 * is a `proceed()` function that can be used inside the resulting callback to check if a component is still mounted,
 * stopping the invocation otherwise.
 * @param fn - a callback factory - supposed to return the callback.
 * @param deps - the hook deps, similar to useMemo/useCallback.
 */
const useAsyncInterruptibleCallback = <Args extends unknown[], Result, Fn extends Callback<Args, Result>>(
  fn: (proceed: Checker) => Fn,
  deps: unknown[] = []
): Fn & Callback<Args, Result | undefined> => {
  const isUnmounted = useRef(false);

  useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return useMemo(() => {
    const checker: Checker = async promise => {
      const result = await promise;
      if (isUnmounted.current) {
        throw interruption;
      }
      return result;
    };

    const callback = fn(checker);

    const interruptible = async (...args: Args): Promise<Result | undefined> => {
      try {
        return await callback(...args);
      } catch (thrown) {
        if (thrown === interruption) {
          return;
        }
        throw thrown;
      }
    };

    return Object.assign(interruptible, callback); // carrying extra properties such as flash/cancel on a debounced fn
  }, deps);
};

export default useAsyncInterruptibleCallback;
