import { type ReactNode, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface Options {
  hasMore: boolean | undefined;
  loading: boolean;
  updating?: boolean;
  fetchMore: () => Promise<unknown>;
}

const useLazyLoading = (renderLoader: (ref: (node?: Element | null) => void) => ReactNode, options: Options) => {
  const { hasMore, loading, updating = false, fetchMore } = options;

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading) {
      fetchMore();
    }
  }, [inView, loading, fetchMore]);

  return hasMore && !updating ? renderLoader(ref) : null;
};

export default useLazyLoading;
