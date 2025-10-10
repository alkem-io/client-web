import { useInView } from 'react-intersection-observer';
import useCalloutDetails from '../../callout/useCalloutDetails/useCalloutDetails';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { CalloutViewSkeleton } from '../../callout/CalloutView/CalloutView';
import { Box } from '@mui/material';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';

/**
 * Checks if the browser is scrolled to the position where the CalloutView is
 * Prints the <CalloutViewSkeleton> if not in the view of the browser, to avoid loading all the callouts at once.
 * Loads the CalloutDetails when the user scrolls to the position of the CalloutView
 */
interface CalloutDetailsContainerProvided {
  callout: CalloutDetailsModelExtended;
  loading: boolean;
  refetch: () => Promise<unknown>;
}

interface CalloutInViewWrapperProps extends SimpleContainerProps<CalloutDetailsContainerProvided> {
  calloutId: string;
  calloutsSetId: string | undefined;
  withClassification?: boolean;
}

const CalloutInViewWrapper = ({
  children,
  calloutId,
  calloutsSetId,
  withClassification = false,
}: CalloutInViewWrapperProps) => {
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

  return (
    <Box ref={ref}>
      {inView && callout && children({ callout, loading, refetch })}
      {(!inView || !callout) && <CalloutViewSkeleton />}
    </Box>
  );
};

export default CalloutInViewWrapper;
