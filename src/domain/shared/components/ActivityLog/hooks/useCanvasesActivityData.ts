import { useMemo } from 'react';
import {
  Activity,
  ActivityEventType,
  CanvasesNamesFromHubQuery,
  CanvasesNamesFromChallengeQuery,
  CanvasesNamesFromOpportunityQuery,
} from '../../../../../models/graphql-schema';
import { useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import {
  useCanvasesNamesFromChallengeQuery,
  useCanvasesNamesFromHubQuery,
  useCanvasesNamesFromOpportunityQuery,
} from '../../../../../hooks/generated/graphql';
import { isChallengeId, isHubId, isOpportunityId } from '../../../types/CoreEntityIds';
import { uniq } from 'lodash';

export type CanvasActivityData = {
  id: string;
  nameID: string;
  calloutNameId: string;
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
};

function flatMapAllCanvases(
  hubData?: CanvasesNamesFromHubQuery,
  challengeData?: CanvasesNamesFromChallengeQuery,
  opportunityData?: CanvasesNamesFromOpportunityQuery
): CanvasActivityData[] {
  const canvases: CanvasActivityData[] = [];

  hubData?.hub?.collaboration?.callouts
    ?.flatMap(callout =>
      callout.canvases?.map(canvas => ({
        ...canvas,
        calloutNameId: callout.nameID,
        hubNameId: hubData.hub.nameID,
      }))
    )
    .filter(canvas => !!canvas)
    .forEach(canvas => canvases.push(canvas!));

  challengeData?.hub?.challenge?.collaboration?.callouts
    ?.flatMap(callout =>
      callout.canvases?.map(canvas => ({
        ...canvas,
        calloutNameId: callout.nameID,
        hubNameId: challengeData.hub.nameID,
        challengeNameId: challengeData.hub.challenge.nameID,
      }))
    )
    .filter(canvas => !!canvas)
    .forEach(canvas => canvases.push(canvas!));

  opportunityData?.hub?.opportunity?.collaboration?.callouts
    ?.flatMap(callout =>
      callout.canvases?.map(canvas => ({
        ...canvas,
        calloutNameId: callout.nameID,
        hubNameId: opportunityData.hub.nameID,
        challengeNameId: opportunityData.hub.opportunity.parentNameID,
        opportunityNameId: opportunityData.hub.opportunity.nameID,
      }))
    )
    .filter(canvas => !!canvas)
    .forEach(canvas => canvases.push(canvas!));

  return canvases;
}

export const useCanvasesActivityData = (activities: Activity[]) => {
  const urlParams = useUrlParams();
  const handleError = useApolloErrorHandler();

  // Get the Ids of the Canvases that have an Activity entry
  const canvasesIds = uniq(
    activities?.filter(a => a.type === ActivityEventType.CanvasCreated).map(a => a.resourceID) || []
  );
  const calloutsIds = uniq(
    activities
      ?.filter(a => a.type === ActivityEventType.CanvasCreated)
      .map(a => a.parentID)
      .filter(c => !!c)
      .map(c => c!) || []
  );

  // Retrieve the relevant information to print these activity entries about canvases
  const { data: hubCanvasesData, loading: hubCanvasesLoading } = useCanvasesNamesFromHubQuery({
    onError: handleError,
    variables: isHubId(urlParams)
      ? {
          hubID: urlParams.hubNameId,
          calloutsIds /* canvasesIds: TODO: Filter by canvases when server doesn't return an error */,
        }
      : undefined,
    skip: !isHubId(urlParams) || canvasesIds.length === 0,
    errorPolicy: 'all',
  });

  const { data: challengeCanvasesData, loading: challengeCanvasesLoading } = useCanvasesNamesFromChallengeQuery({
    onError: handleError,
    variables: isChallengeId(urlParams)
      ? {
          hubID: urlParams.hubNameId,
          challengeId: urlParams.challengeNameId,
          calloutsIds /* canvasesIds: TODO: Filter by canvases when server doesn't return an error */,
        }
      : undefined,
    skip: !isChallengeId(urlParams) || canvasesIds.length === 0,
    errorPolicy: 'all',
  });

  const { data: opportunityCanvasesData, loading: opportunityCanvasesLoading } = useCanvasesNamesFromOpportunityQuery({
    onError: handleError,
    variables: isOpportunityId(urlParams)
      ? {
          hubID: urlParams.hubNameId,
          opportunityId: urlParams.opportunityNameId,
          calloutsIds /* canvasesIds: TODO: Filter by canvases when server doesn't return an error */,
        }
      : undefined,
    skip: !isOpportunityId(urlParams) || canvasesIds.length === 0,
    errorPolicy: 'all',
  });

  // Join the information together
  const canvasesActivityData = useMemo(
    () => flatMapAllCanvases(hubCanvasesData, challengeCanvasesData, opportunityCanvasesData),
    [hubCanvasesData, challengeCanvasesData, opportunityCanvasesData]
  );

  return {
    canvasesActivityData,
    loading: hubCanvasesLoading || challengeCanvasesLoading || opportunityCanvasesLoading,
  };
};
