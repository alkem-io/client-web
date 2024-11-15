import React, { Ref, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCalloutDetailsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { TypedCallout, TypedCalloutDetails } from '../useCallouts/useCallouts';

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
    },
    skip: !inView,
  });

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
      whiteboard: calloutDetails.framing.whiteboard
        ? { ...calloutDetails.framing.whiteboard, calloutNameId: callout.nameID }
        : undefined,
    };

    return {
      ...callout,
      ...calloutDetails,
      framing,
      comments: calloutDetails.comments ? { ...calloutDetails.comments, calloutNameId: callout.nameID } : undefined,
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
