import React, { useMemo } from 'react';
import Gutters from '../../../../core/ui/grid/Gutters';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../../domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import GridItem from '../../../../core/ui/grid/GridItem';
import { AuthorizationPrivilege, CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useMyMembershipsSubspaceQuery } from '../../../../core/apollo/generated/apollo-hooks';
import isJourneyMember from '../../../../domain/journey/utils/isJourneyMember';

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

  const { data, loading } = useMyMembershipsSubspaceQuery({
    variables: {
      subspaceId: challenge.id,
    },
    skip: !canReadChallenge,
  });

  const hydratedChallenge = useMemo(() => {
    return {
      ...challenge,
      ...data?.lookup.space!,
      opportunities: data?.lookup.space?.subspaces?.filter(isJourneyMember),
    };
  }, [challenge, data]);

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

  if (!data?.lookup.space) {
    return null; // Challenge not found, unlikely but possible
  }

  return (
    <GridItem columns={4}>
      <Gutters disablePadding>
        <JourneyCardHorizontal journey={hydratedChallenge} journeyTypeName="subspace" />
        {hydratedChallenge.subspaces?.map(opportunity => (
          <JourneyCardHorizontal journey={opportunity} journeyTypeName="subsubspace" />
        ))}
      </Gutters>
    </GridItem>
  );
};

export default MyMembershipsChallenge;
