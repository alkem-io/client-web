import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface Options {
  loading: boolean;
  fetchMore: () => Promise<void>;
}

const useLazyLoading = ({ loading, fetchMore }: Options) => {
  const { ref, inView } = useInView();

  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (inView && !isLoading) {
      setIsLoading(true);
      (async () => {
        try {
          await fetchMore();
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [inView, isLoading]);

  return {
    ref,
    loading: isLoading,
  };
};

export default useLazyLoading;
