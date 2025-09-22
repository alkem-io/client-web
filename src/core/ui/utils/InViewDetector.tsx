import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Box } from '@mui/material';
import { IntersectionOptions, useInView } from 'react-intersection-observer';

interface InViewDetectorProvided {
  inView: boolean;
}

interface InViewDetectorProps extends SimpleContainerProps<InViewDetectorProvided>, IntersectionOptions {}

/**
 * A component that detects if its children are in view using the Intersection Observer API and pass it to the children
 * @returns
 */
const InViewDetector = ({ children, ...props }: InViewDetectorProps) => {
  const { ref, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
    ...props,
  });

  return <Box ref={ref}>{children({ inView })}</Box>;
};

export default InViewDetector;
