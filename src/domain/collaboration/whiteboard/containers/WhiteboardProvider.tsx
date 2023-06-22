import React, { FC } from 'react';
import {
  useChallengeWhiteboardFromCalloutQuery,
  useSpaceWhiteboardFromCalloutQuery,
  useOpportunityWhiteboardFromCalloutQuery,
  useWhiteboardTemplatesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  WhiteboardDetailsFragment,
  CollaborationWithWhiteboardDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { getWhiteboardCallout } from './getWhiteboardCallout';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';

interface WhiteboardLocation extends JourneyLocation {
  calloutNameId: string;
  whiteboardNameId: string;
}

interface WhiteboardProviderProps extends WhiteboardLocation {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export type TemplateQuery = {
  [key in 'challengeId' | 'opportunityId']?: string;
} & { spaceId: string };

export interface IProvidedEntities {
  whiteboard: WhiteboardDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithWhiteboardDetailsFragment['callouts']>[0]['authorization'];
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
  loadingTemplates: boolean;
}

const WhiteboardProvider: FC<WhiteboardProviderProps> = ({
  spaceNameId: spaceId,
  challengeNameId: challengeId = '',
  opportunityNameId: opportunityId = '',
  calloutNameId: calloutId,
  whiteboardNameId: whiteboardId,
  children,
}) => {
  const { data: whiteboardTemplates, loading: loadingTemplates } = useWhiteboardTemplatesQuery({
    variables: { spaceId },
  });

  const { data: spaceData, loading: loadingSpace } = useSpaceWhiteboardFromCalloutQuery({
    variables: { spaceId, calloutId, whiteboardId },
    skip: !!(challengeId || opportunityId),
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeWhiteboardFromCalloutQuery({
    variables: { spaceId, challengeId, calloutId, whiteboardId },
    skip: !challengeId || !!opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityWhiteboardFromCalloutQuery({
    variables: { spaceId, opportunityId, calloutId, whiteboardId },
    skip: !opportunityId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const callout =
    getWhiteboardCallout(spaceData?.space.collaboration?.callouts, calloutId) ??
    getWhiteboardCallout(challengeData?.space.challenge.collaboration?.callouts, calloutId) ??
    getWhiteboardCallout(opportunityData?.space.opportunity.collaboration?.callouts, calloutId);

  const whiteboard =
    callout?.whiteboards?.find(whiteboard => whiteboard.nameID === whiteboardId || whiteboard.id === whiteboardId) ??
    undefined;

  const templates = whiteboardTemplates?.space.templates?.whiteboardTemplates ?? [];
  const authorization = callout?.authorization;

  return (
    <>
      {children(
        { whiteboard, templates, calloutId, authorization },
        { loadingWhiteboards: loadingSpace || loadingChallenge || loadingOpportunity, loadingTemplates }
      )}
    </>
  );
};

export { WhiteboardProvider };
