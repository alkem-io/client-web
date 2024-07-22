import useLoadingState, { Callback, Provided } from './useLoadingState';
import { useCallback } from 'react';

interface Handlers {
  onError?: (error: Error) => void;
}

const useLoadingStateWithHandlers = <Args extends unknown[], Result>(
  originalCallback: Callback<Args, Result>,
  { onError }: Handlers
): Provided<Args, Result | undefined> => {
  const [callback, ...rest] = useLoadingState(originalCallback);

  const callbackWithHandlers = useCallback(
    async (...args: Args) => {
      try {
        return await callback(...args);
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error);
        }
      }
    },
    [callback, onError]
  );

  return [callbackWithHandlers, ...rest];
};

export default useLoadingStateWithHandlers;
