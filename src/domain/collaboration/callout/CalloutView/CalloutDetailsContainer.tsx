import { Ref, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCalloutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { TypedCallout, TypedCalloutDetails } from '../../new-callout/models/TypedCallout';
import { EmptyTagset } from '@/domain/common/tagset/TagsetModel';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';

type CalloutDetailsContainerProvided = {
  ref: Ref<Element>;
  callout: TypedCalloutDetails | undefined;
  loading: boolean;
};

interface CalloutDetailsContainerProps extends SimpleContainerProps<CalloutDetailsContainerProvided> {
  callout: TypedCallout;
}

const CalloutDetailsContainer = ({ callout, children }: CalloutDetailsContainerProps) => {
  const { ref: intersectionObserverRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { data, loading } = useCalloutDetailsQuery({
    variables: {
      calloutId: callout.id,
      withClassification: callout.classificationTagsets.length > 0,
    },
    skip: !inView,
  });

  /**
   * This function hydrates the callout with the additional details fetched from the server.
   */
  const result: TypedCalloutDetails | undefined = useMemo(() => {
    const calloutDetails = data?.lookup.callout;

    if (!calloutDetails) {
      return;
    }

    const framing = {
      ...callout.framing,
      ...calloutDetails.framing,
      profile: {
        ...callout.framing.profile,
        ...calloutDetails.framing.profile,
      },
      whiteboard: calloutDetails.framing.whiteboard,
    };
    // TODO: Refactor this
    // Probably can be done much better, typescript is complaining because many optional things on TypedCallout are now required in TypedCalloutDetails,
    // and it is not sure if we have all the data we need for framing and for classification
    const classification = {
      ...callout.classification,
      flowState: {
        ...EmptyTagset,
        name: TagsetReservedName.FlowState,
        ...callout.classification?.flowState,
      },
      ...calloutDetails.classification,
    };

    return {
      ...callout,
      ...calloutDetails,
      framing,
      classification,
      comments: calloutDetails.comments,
      contributions: calloutDetails.contributions ?? [],
    };
  }, [callout, loading, data?.lookup.callout]);

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        callout: result,
        loading,
      })}
    </>
  );
};

export default CalloutDetailsContainer;
