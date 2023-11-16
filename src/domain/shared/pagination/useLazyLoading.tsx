import { ComponentType, Ref, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface Options {
  hasMore: boolean;
  loading: boolean;
  updating?: boolean;
  fetchMore: () => Promise<void>;
}

const useLazyLoading = <RefValue,>(Loader: ComponentType<{ ref: Ref<RefValue> }>, options: Options) => {
  const { hasMore, loading, updating = false, fetchMore } = options;
  // TODO: Reenable LazyLoading
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, inView: _inView } = useInView();
  const inView = true;

  useEffect(() => {
    if (inView && !loading) {
      fetchMore();
    }
  }, [inView, loading, fetchMore]);

  return hasMore && !updating ? <Loader ref={ref as Ref<RefValue>} /> : null;
};

export default useLazyLoading;
