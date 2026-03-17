import { useInView } from 'react-intersection-observer';
import type { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import useCalloutDetails from '../../callout/useCalloutDetails/useCalloutDetails';

interface UseCalloutInViewOptions {
  calloutId: string;
  calloutsSetId: string | undefined;
  withClassification?: boolean;
}

interface UseCalloutInViewResult {
  ref: (node?: Element | null) => void;
  inView: boolean;
  callout: CalloutDetailsModelExtended | undefined;
  loading: boolean;
  refetch: () => Promise<unknown>;
}

const useCalloutInView = ({
  calloutId,
  calloutsSetId,
  withClassification = false,
}: UseCalloutInViewOptions): UseCalloutInViewResult => {
  const { ref, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { callout, loading, refetch } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification,
    skip: !inView,
  });

  return { ref, inView, callout, loading, refetch };
};

export default useCalloutInView;
