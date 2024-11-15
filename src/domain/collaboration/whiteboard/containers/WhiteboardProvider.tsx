import React, { FC } from 'react';
import { useWhiteboardFromCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  WhiteboardDetailsFragment,
  CollaborationWithWhiteboardDetailsFragment,
} from '@/core/apollo/generated/graphql-schema';

interface WhiteboardLocation {
  calloutId: string | undefined;
  whiteboardNameId: string;
}

interface WhiteboardProviderProps extends WhiteboardLocation {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export interface IProvidedEntities {
  whiteboard: WhiteboardDetailsFragment | undefined;
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithWhiteboardDetailsFragment['callouts']>[0]['authorization'];
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
}

const WhiteboardProvider: FC<WhiteboardProviderProps> = ({ calloutId, whiteboardNameId: whiteboardId, children }) => {
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

  const framingWhiteboard = callout?.framing.whiteboard;

  const authorization = callout?.authorization;

  return (
    <>
      {children(
        {
          whiteboard: framingWhiteboard ?? whiteboardContribution?.whiteboard,
          calloutId,
          authorization,
        },
        { loadingWhiteboards: loading }
      )}
    </>
  );
};

export { WhiteboardProvider };
