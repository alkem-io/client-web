import { useEffect, useRef, useState } from 'react';

export interface Callback<Args extends unknown[], Result> {
  (...args: Args): Promise<Result>;
}

export type Provided<Args extends unknown[], Result> = [
  callback: Callback<Args, Result>,
  isLoading: boolean,
  error: Error | undefined
];

const useLoadingState = <Args extends unknown[], Result>(
  originalCallback: Callback<Args, Result>
): Provided<Args, Result> => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const callback = async (...args: Args) => {
    if (isMountedRef.current) setIsLoading(true);
    try {
      return await originalCallback(...args);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
      throw error;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  return [callback, isLoading, error];
};

export default useLoadingState;
