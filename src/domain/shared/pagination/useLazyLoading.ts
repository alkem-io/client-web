import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface Options {
  loading: boolean;
  fetchMore: () => Promise<void>;
}

const useLazyLoading = ({ loading, fetchMore }: Options) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading) {
      fetchMore();
    }
  }, [inView, loading]);

  return {
    ref,
  };
};

export default useLazyLoading;
