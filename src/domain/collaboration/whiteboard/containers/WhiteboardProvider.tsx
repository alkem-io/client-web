import { useWhiteboardFromCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  CollaborationWithWhiteboardDetailsFragment,
  WhiteboardDetailsFragment,
} from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import React from 'react';
import buildGuestShareUrl from '../utils/buildGuestShareUrl';

interface WhiteboardProviderProps {
  children: (entities: IProvidedEntities, state: IProvidedEntitiesState) => React.ReactNode;
}

export interface IProvidedEntities {
  whiteboard: WhiteboardDetailsFragment | undefined;
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithWhiteboardDetailsFragment['calloutsSet']['callouts']>[0]['authorization'];
  guestShareUrl?: string;
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
}

const WhiteboardProvider = ({ children }: WhiteboardProviderProps) => {
  const { calloutId, contributionId } = useUrlResolver();
  const { data, loading } = useWhiteboardFromCalloutQuery({
    variables: { calloutId: calloutId!, contributionId: contributionId! },
    skip: !calloutId || !contributionId,
  });

  const callout = data?.lookup.callout;
  const whiteboardContribution = callout?.contributions[0];

  const authorization = callout?.authorization;
  const guestShareUrl = whiteboardContribution?.whiteboard
    ? buildGuestShareUrl(whiteboardContribution.whiteboard.id ?? whiteboardContribution.whiteboard.nameID)
    : undefined;

  return (
    <>
      {children(
        {
          whiteboard: whiteboardContribution?.whiteboard,
          calloutId,
          authorization,
          guestShareUrl,
        },
        { loadingWhiteboards: loading }
      )}
    </>
  );
};

export { WhiteboardProvider };
