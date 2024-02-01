import React, { FC } from 'react';
import { useWhiteboardRtFromCalloutQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { WhiteboardRtDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';

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
  calloutId: string | undefined;
  authorization: WhiteboardRtDetailsFragment['authorization'];
}

export interface IProvidedEntitiesState {
  loadingWhiteboards: boolean;
  loadingTemplates: boolean;
}

const WhiteboardRtProvider: FC<WhiteboardRtProviderProps> = ({
  calloutId,
  whiteboardNameId: whiteboardId,
  children,
}) => {
  const { data, loading } = useWhiteboardRtFromCalloutQuery({
    variables: { calloutId: calloutId! },
    skip: !calloutId || !whiteboardId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // TODO: Check if this is still needed
  });

  const callout = data?.lookup.callout;

  const authorization = callout?.framing.whiteboardRt?.authorization;

  return (
    <>
      {children(
        { whiteboard: callout?.framing.whiteboardRt, calloutId, authorization },
        { loadingWhiteboards: loading, loadingTemplates: false }
      )}
    </>
  );
};

export { WhiteboardRtProvider };
