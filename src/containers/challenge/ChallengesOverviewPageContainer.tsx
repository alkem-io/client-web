import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';

export interface ChallengesOverviewContainerEntities {
  userChallenges: any[];
  userHubs: any[];
}

export interface ChallengesOverviewContainerActions {}

export interface ChallengesOverviewContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengePageContainerProps
  extends ContainerProps<
    ChallengesOverviewContainerEntities,
    ChallengesOverviewContainerActions,
    ChallengesOverviewContainerState
  > {}

export const ChallengesOverviewPageContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const userChallenges = [];
  const userHubs = [];

  return <>{children({ userChallenges, userHubs }, { loading: false, error: undefined }, {})}</>;
};
