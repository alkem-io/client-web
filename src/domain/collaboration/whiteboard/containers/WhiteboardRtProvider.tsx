import React, { FC } from 'react';
import {
  useWhiteboardRtFromCalloutQuery,
  useWhiteboardTemplatesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  WhiteboardRtDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';

interface WhiteboardLocation {
  calloutId: string | undefined;
  spaceId: string;
  whiteboardNameId: string;
}

interface WhiteboardRtProviderProps extends WhiteboardLocation {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export interface IProvidedEntities {
  whiteboard: WhiteboardRtDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: WhiteboardRtDetailsFragment['authorization'];
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
  loadingTemplates: boolean;
}

const WhiteboardRtProvider: FC<WhiteboardRtProviderProps> = ({
  spaceId,
  calloutId,
  whiteboardNameId: whiteboardId,
  children,
}) => {
  const { data: whiteboardTemplates, loading: loadingTemplates } = useWhiteboardTemplatesQuery({
    variables: { spaceId },
  });

  const { data, loading } = useWhiteboardRtFromCalloutQuery({
    variables: { calloutId: calloutId! },
    skip: !calloutId || !whiteboardId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // TODO: Check if this is still needed
  });

  const callout = data?.lookup.callout;

  const templates = whiteboardTemplates?.space.templates?.whiteboardTemplates ?? [];
  const authorization = callout?.framing.whiteboardRt?.authorization;

  return (
    <>
      {children(
        { whiteboard: callout?.framing.whiteboardRt, templates, calloutId, authorization },
        { loadingWhiteboards: loading, loadingTemplates }
      )}
    </>
  );
};

export { WhiteboardRtProvider };
