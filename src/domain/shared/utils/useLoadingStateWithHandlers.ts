import useLoadingState, { type Callback, type Provided } from './useLoadingState';

interface Handlers {
  onError?: (error: Error) => void;
}

const useLoadingStateWithHandlers = <Args extends unknown[], Result>(
  originalCallback: Callback<Args, Result>,
  { onError }: Handlers
): Provided<Args, Result | undefined> => {
  const [callback, ...rest] = useLoadingState(originalCallback);

  const callbackWithHandlers = async (...args: Args) => {
    try {
      return await callback(...args);
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
    }
  };

  return [callbackWithHandlers, ...rest];
};

export default useLoadingStateWithHandlers;
