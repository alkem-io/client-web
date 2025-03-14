import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, SubspaceCardFragment } from '@/core/apollo/generated/graphql-schema';
import { ContainerChildProps } from '@/core/container/container';
import { ApolloError } from '@apollo/client';
import { FC } from 'react';
import useSubSpaceCreatedSubscription from '../hooks/useSubSpaceCreatedSubscription';

export interface SubspaceCardContainerEntities {
  subspaces: SubspaceCardFragment[];
  level: SpaceLevel;
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

  // @ts-ignore react-18
  useSubSpaceCreatedSubscription(data, data => data?.lookup.space, subscribeToMore);
  const space = data?.lookup.space;

  const subspaces = space?.subspaces ?? [];
  const level = space?.level ?? SpaceLevel.L0;

  return <>{children({ subspaces, level }, { loading, error }, {})}</>;
};

export default SubspacesContainer;
