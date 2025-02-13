import React, { PropsWithChildren } from 'react';
import { useWhiteboardFromCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  WhiteboardDetailsFragment,
  CollaborationWithWhiteboardDetailsFragment,
} from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

interface WhiteboardProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export interface IProvidedEntities {
  whiteboard: WhiteboardDetailsFragment | undefined;
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithWhiteboardDetailsFragment['calloutsSet']['callouts']>[0]['authorization'];
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
}

const WhiteboardProvider = ({ children }: PropsWithChildren<WhiteboardProviderProps>) => {
  const { calloutId, contributionId } = useUrlResolver();
  const { data, loading } = useWhiteboardFromCalloutQuery({
    variables: { calloutId: calloutId!, contributionId: contributionId! },
    skip: !calloutId || !contributionId,
  });

  const callout = data?.lookup.callout;
  const whiteboardContribution = callout?.contributions[0];

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
