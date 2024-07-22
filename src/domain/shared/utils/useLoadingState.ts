import { useState } from 'react';

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

  const callback = async (...args: Args) => {
    setIsLoading(true);
    try {
      return await originalCallback(...args);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [callback, isLoading, error];
};

export default useLoadingState;
