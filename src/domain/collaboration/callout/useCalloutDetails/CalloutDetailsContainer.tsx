import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useCalloutDetails, { useCalloutDetailsProps, useCalloutDetailsProvided } from './useCalloutDetails';

/**
 * This is just a container around useCalloutDetails to avoid a bigger refactor on CalloutsView
 */

interface CalloutDetailsContainerProvided extends useCalloutDetailsProvided {}

interface CalloutDetailsContainerProps
  extends SimpleContainerProps<CalloutDetailsContainerProvided>,
    useCalloutDetailsProps {}

const CalloutDetailsContainer = ({ children, ...props }: CalloutDetailsContainerProps) => {
  const data = useCalloutDetails(props);
  return children(data);
};

export default CalloutDetailsContainer;
