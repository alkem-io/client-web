import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import useSubSpaceCreatedSubscription from '../hooks/useSubSpaceCreatedSubscription';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@/core/container/container';
import { SubspaceCardFragment } from '@/core/apollo/generated/graphql-schema';

export interface SubspaceCardContainerEntities {
  subspaces: SubspaceCardFragment[];
}

export interface SubspaceCardContainerActions {}

export interface SubspaceCardContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface SubspacesContainerProps
  extends ContainerChildProps<SubspaceCardContainerEntities, SubspaceCardContainerActions, SubspaceCardContainerState> {
  spaceId: string | undefined;
}

export const SubspacesContainer: FC<SubspacesContainerProps> = ({ spaceId, children }) => {
  const { data, error, loading, subscribeToMore } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  useSubSpaceCreatedSubscription(data, data => data?.lookup.space, subscribeToMore);

  const subspaces = data?.lookup.space?.subspaces ?? [];

  return <>{children({ subspaces }, { loading, error }, {})}</>;
};

export default SubspacesContainer;
