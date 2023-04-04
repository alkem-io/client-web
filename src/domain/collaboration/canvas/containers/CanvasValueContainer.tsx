import { FC, useEffect, useMemo } from 'react';
import { useUserContext } from '../../../community/contributor/user';
import {
  CanvasContentUpdatedDocument,
  useChallengeCanvasValuesQuery,
  useHubCanvasValuesQuery,
  useHubTemplateCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
  usePlatformTemplateCanvasValuesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  Canvas,
  CanvasContentUpdatedSubscription,
  CanvasDetailsFragment,
  CanvasValueFragment,
  SubscriptionCanvasContentUpdatedArgs,
} from '../../../../core/apollo/generated/graphql-schema';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import findById from '../../../shared/utils/findById';
import { getCanvasCalloutContainingCanvas } from './getCanvasCallout';
import { compact } from 'lodash';
import EmptyWhiteboard from '../../../../common/components/composite/entities/Canvas/EmptyWhiteboard';

export interface ICanvasValueEntities {
  canvas?: CanvasValueFragment & CanvasDetailsFragment;
}

export interface CanvasValueContainerState {
  loadingCanvasValue?: boolean;
}

export interface CanvasLocation {
  hubNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  calloutId?: string;
  innovationPackId?: string;
  canvasId?: string;

  isNew?: boolean;
  isContribution?: boolean;
  isHubTemplate?: boolean;
  isPlatformTemplate?: boolean;
}

const validateCanvasLocation = (location: CanvasLocation) => {
  if (!location.isNew && !location.canvasId) {
    // If it's not a new canvas, CanvasId must be set
    return false;
  }
  // One and only one mode of location to locate the canvas:
  if (compact([location.isContribution, location.isHubTemplate, location.isPlatformTemplate]).length !== 1) {
    return false;
  }
  if (location.isContribution && (!location.hubNameId || !location.calloutId)) {
    // If it is a contribution, at least hub and callout must be specified
    return false;
  }
  if (location.opportunityNameId && (!location.isContribution || !location.hubNameId)) {
    // If Opportunity is set then it must be a contribution and hub must be set (we don't care about challenge)
    return false;
  }
  if (location.challengeNameId && (!location.isContribution || !location.hubNameId)) {
    // If Challenge is set then it must be a contribution and hub must be set
    return false;
  }
  if (location.isHubTemplate && !location.hubNameId) {
    // If it is a hub template, hub must be specified
    return false;
  }
  if (location.isPlatformTemplate && !location.innovationPackId) {
    // If it is platform template, innovationPackId must be specified
    return false;
  }
  return true;
};

// CanvasDetails is generic now: Sometimes brings Canvas details (author etc), sometimes CanvasTemplateDetails
export interface CanvasValueContainerProps
  extends ContainerChildProps<ICanvasValueEntities, {}, CanvasValueContainerState> {
  canvasLocation: CanvasLocation;
  onCanvasValueLoaded?: (canvas: Canvas) => void;
}

const useSubscribeToCanvas = UseSubscriptionToSubEntity<
  CanvasValueFragment & CanvasDetailsFragment,
  CanvasContentUpdatedSubscription,
  SubscriptionCanvasContentUpdatedArgs
>({
  subscriptionDocument: CanvasContentUpdatedDocument,
  getSubscriptionVariables: canvas => ({ canvasIDs: [canvas.id] }),
  updateSubEntity: (canvas, subscriptionData) => {
    if (canvas) {
      canvas.value = subscriptionData.canvasContentUpdated.value;
    }
  },
});

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({ children, canvasLocation, onCanvasValueLoaded }) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  const validRequest = validateCanvasLocation(canvasLocation);
  console.log('validRequest', validRequest, canvasLocation);

  const { isNew, canvasId, calloutId, hubNameId, challengeNameId, opportunityNameId, innovationPackId } =
    canvasLocation;

  const skipHub =
    !validRequest || !isNew || !canvasLocation.isContribution || Boolean(challengeNameId) || Boolean(opportunityNameId);
  const skipChallenge =
    !validRequest ||
    !isNew ||
    !canvasLocation.isContribution ||
    Boolean(opportunityNameId) ||
    !Boolean(challengeNameId);
  const skipOpportunity = !validRequest || !isNew || !canvasLocation.isContribution || !Boolean(opportunityNameId);
  const skipHubTemplate = !validRequest || !isNew || !canvasLocation.isHubTemplate;
  const skipPlatformTemplate = !validRequest || !isNew || !canvasLocation.isPlatformTemplate;

  const {
    data: challengeData,
    loading: loadingChallengeCanvasValue,
    subscribeToMore: subChallenge,
  } = useChallengeCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipChallenge,
    variables: {
      hubId: hubNameId!,
      challengeId: challengeNameId!,
      canvasId: canvasId!,
      calloutId: calloutId!,
    },
  });

  const {
    data: opportunityData,
    loading: loadingOpportunityCanvasValue,
    subscribeToMore: subOpportunity,
  } = useOpportunityCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipOpportunity,
    variables: {
      hubId: hubNameId!,
      opportunityId: opportunityNameId!,
      calloutId: calloutId!,
      canvasId: canvasId!,
    },
  });

  const {
    data: hubData,
    loading: loadingHubCanvasValue,
    subscribeToMore: subHub,
  } = useHubCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipHub,
    variables: {
      hubId: hubNameId!,
      canvasId: canvasId!,
      calloutId: calloutId!,
    },
  });

  const {
    data: hubTemplatesData,
    loading: loadingHubTemplateCanvasValue,
    subscribeToMore: subHubTemplate,
  } = useHubTemplateCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipHubTemplate,
    variables: {
      hubId: hubNameId!,
      canvasId: canvasId!,
    },
  });

  const {
    data: platformTemplatesData,
    loading: loadingPlatformTemplateCanvasValue,
    subscribeToMore: subPlatformTemplate,
  } = usePlatformTemplateCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipPlatformTemplate,
    variables: {
      innovationPackId: innovationPackId!,
      canvasId: canvasId!,
    },
  });

  const canvas = useMemo(() => {
    if (canvasLocation.isContribution) {
      const sourceArray =
        getCanvasCalloutContainingCanvas(hubData?.hub.collaboration?.callouts, canvasId!)?.canvases ||
        getCanvasCalloutContainingCanvas(challengeData?.hub.challenge.collaboration?.callouts, canvasId!)?.canvases ||
        getCanvasCalloutContainingCanvas(opportunityData?.hub.opportunity.collaboration?.callouts, canvasId!)?.canvases;

      return sourceArray?.find(c => c.id === canvasId) as Canvas | undefined; //!! not nice
    } else if (canvasLocation.isHubTemplate) {
      return hubTemplatesData?.hub.templates?.whiteboardTemplate as Canvas | undefined; //!!
    } else if (canvasLocation.isPlatformTemplate) {
      return platformTemplatesData?.platform.library.innovationPack?.templates?.whiteboardTemplate as
        | Canvas
        | undefined; //!!
    } else if (canvasLocation.isNew) {
      return {
        profile: {
          displayName: 'New canvas template //!!',
        },
        createdDate: new Date(),
        value: JSON.stringify(EmptyWhiteboard),
      } as Canvas | undefined; //!! this is gonna break...
    }
  }, [hubData, challengeData, opportunityData, canvasId]);

  useEffect(() => {
    if (canvas) {
      onCanvasValueLoaded?.(canvas);
    }
  }, [canvas, onCanvasValueLoaded]);

  let skipCanvasSubscription = !canvasId || canvas?.checkout?.lockedBy === userId; //!! const

  useSubscribeToCanvas(
    hubData,
    data =>
      findById(getCanvasCalloutContainingCanvas(data?.hub.collaboration?.callouts, canvasId!)?.canvases, canvasId!),
    subHub,
    {
      skip: skipCanvasSubscription,
    }
  );

  useSubscribeToCanvas(
    challengeData,
    data =>
      findById(
        getCanvasCalloutContainingCanvas(data?.hub.challenge.collaboration?.callouts, canvasId!)?.canvases,
        canvasId!
      ),
    subChallenge,
    { skip: skipCanvasSubscription }
  );

  useSubscribeToCanvas(
    opportunityData,
    data =>
      findById(
        getCanvasCalloutContainingCanvas(data?.hub.opportunity.collaboration?.callouts, canvasId!)?.canvases,
        canvasId!
      ),
    subOpportunity,
    { skip: skipCanvasSubscription }
  );

  // Probably there is no subscription to templates
  skipCanvasSubscription = true;
  useSubscribeToCanvas(
    hubTemplatesData,
    data => data?.hub.templates?.whiteboardTemplate as Canvas, //!!
    subHubTemplate,
    {
      skip: skipCanvasSubscription,
    }
  );

  useSubscribeToCanvas(
    platformTemplatesData,
    data => data?.platform.library.innovationPack?.templates?.whiteboardTemplate as Canvas, //!!
    subPlatformTemplate,
    {
      skip: skipCanvasSubscription,
    }
  );

  return (
    <>
      {children(
        {
          canvas,
        },
        {
          loadingCanvasValue:
            loadingHubCanvasValue ||
            loadingChallengeCanvasValue ||
            loadingOpportunityCanvasValue ||
            loadingHubTemplateCanvasValue ||
            loadingPlatformTemplateCanvasValue,
        },
        {}
      )}
    </>
  );
};

export default CanvasValueContainer;
