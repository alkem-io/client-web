import React, { useMemo } from 'react';
import Gutters from '../../../../core/ui/grid/Gutters';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../../domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import GridItem from '../../../../core/ui/grid/GridItem';
import { AuthorizationPrivilege, CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useMyMembershipsChallengeQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface MyMembershipsChallengeProps {
  challenge: Identifiable & {
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    community?: {
      myRoles?: CommunityRole[];
    };
  };
}

const MyMembershipsChallenge = ({ challenge }: MyMembershipsChallengeProps) => {
  const canReadChallenge = challenge.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data, loading } = useMyMembershipsChallengeQuery({
    variables: {
      challengeId: challenge.id,
    },
    skip: !canReadChallenge,
  });

  const hydratedChallenge = useMemo(() => ({ ...challenge, ...data?.lookup.challenge! }), [challenge, data]);

  if (!canReadChallenge) {
    return null;
  }

  if (loading) {
    return (
      <GridItem columns={4}>
        <Gutters disablePadding>
          <JourneyCardHorizontalSkeleton />
        </Gutters>
      </GridItem>
    );
  }

  if (!data?.lookup.challenge) {
    return null; // Challenge not found, unlikely but possible
  }

  return (
    <GridItem columns={4}>
      <Gutters disablePadding>
        <JourneyCardHorizontal journey={hydratedChallenge} journeyTypeName="challenge" />
        {hydratedChallenge.opportunities?.map(opportunity => (
          <JourneyCardHorizontal journey={opportunity} journeyTypeName="opportunity" />
        ))}
      </Gutters>
    </GridItem>
  );
};

export default MyMembershipsChallenge;
