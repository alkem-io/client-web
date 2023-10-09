import React, { FC } from 'react';
import {
  useWhiteboardFromCalloutQuery,
  useWhiteboardTemplatesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  WhiteboardDetailsFragment,
  CollaborationWithWhiteboardDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';

interface WhiteboardLocation {
  calloutId: string | undefined;
  spaceId: string;
  whiteboardNameId: string;
}

interface WhiteboardProviderProps extends WhiteboardLocation {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

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
  spaceId,
  calloutId,
  whiteboardNameId: whiteboardId,
  children,
}) => {
  const { data: whiteboardTemplates, loading: loadingTemplates } = useWhiteboardTemplatesQuery({
    variables: { spaceId },
  });

  const { data, loading } = useWhiteboardFromCalloutQuery({
    variables: { calloutId: calloutId!, whiteboardId },
    skip: !calloutId || !whiteboardId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // TODO: Check if this is still needed
  });

  const callout = data?.lookup.callout;

  const whiteboardContribution = callout?.contributions?.find(
    contribution =>
      contribution.whiteboard &&
      (contribution.whiteboard.nameID === whiteboardId || contribution.whiteboard.id === whiteboardId)
  );

  const templates = whiteboardTemplates?.space.templates?.whiteboardTemplates ?? [];
  const authorization = callout?.authorization;

  return (
    <>
      {children(
        { whiteboard: whiteboardContribution?.whiteboard, templates, calloutId, authorization },
        { loadingWhiteboards: loading, loadingTemplates }
      )}
    </>
  );
};

export { WhiteboardProvider };
