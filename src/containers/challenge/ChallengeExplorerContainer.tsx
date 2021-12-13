import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import { SimpleEcoverseResultEntryFragment } from '../../models/graphql-schema';
import { useChallengesOverviewPageQuery } from '../../hooks/generated/graphql';
import { useUserContext } from '../../hooks';

export type SimpleChallenge = {
  id: string;
  ecoverseId: string;
};

export interface ChallengesOverviewContainerEntities {
  userChallenges?: SimpleChallenge[];
  userHubs?: SimpleEcoverseResultEntryFragment[];
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

export const ChallengeExplorerContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { data, loading, error } = useChallengesOverviewPageQuery({
    variables: {
      membershipData: {
        userID: user?.id || '',
      },
    },
    skip: !user,
  });
  const ecoverses = data?.membershipUser.ecoverses;
  const userChallenges: SimpleChallenge[] | undefined =
    ecoverses &&
    ecoverses.flatMap(x =>
      x?.challenges.map(y => ({
        id: y.id,
        ecoverseId: x.ecoverseID,
      }))
    );

  const userHubs: SimpleEcoverseResultEntryFragment[] | undefined =
    ecoverses &&
    ecoverses.map(({ ecoverseID, displayName, nameID }) => ({
      ecoverseID,
      displayName,
      nameID,
    }));

  return <>{children({ userChallenges, userHubs }, { loading, error }, {})}</>;
};
