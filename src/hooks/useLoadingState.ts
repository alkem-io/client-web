import { useState } from 'react';

function useLoadingState<Args extends [], Result>(
  originalCallback: (...args: Args) => Promise<Result>
): [isLoading: boolean, callback: (...args: Args) => Promise<Result>] {
  const [isLoading, setIsLoading] = useState(false);

  const callback = async (...args: Args) => {
    setIsLoading(true);
    try {
      return await originalCallback(...args);
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, callback];
}

export default useLoadingState;
