import React, { useMemo } from 'react';
import Gutters from '../../../../core/ui/grid/Gutters';
import JourneyCardHorizontal from '../../../../domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import GridItem from '../../../../core/ui/grid/GridItem';
import { AuthorizationPrivilege, CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import isJourneyMember from '../../../../domain/journey/utils/isJourneyMember';
import { MembershipProps } from './MyMembershipsDialog';

interface MyMembershipsSubSpaceProps {
  subspace: Identifiable & {
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    community?: {
      myRoles?: CommunityRole[];
    };
  };
  getMembership(id: string): MembershipProps;
}

const MyMembershipsSubSpace = ({ subspace, getMembership }: MyMembershipsSubSpaceProps) => {
  const canReadSubSpace = subspace.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const hydratedSubSpace = useMemo(() => {
    return {
      ...subspace,
      ...getMembership(subspace.id),
      subSubSpaces: getMembership(subspace.id)?.subspaces?.filter(isJourneyMember),
    };
  }, [subspace]);

  if (!canReadSubSpace) {
    return null;
  }

  return (
    <GridItem columns={4}>
      <Gutters disablePadding>
        <JourneyCardHorizontal journey={hydratedSubSpace} journeyTypeName="subspace" />
        {hydratedSubSpace.subSubSpaces?.map(subSubSpace => (
          <JourneyCardHorizontal journey={getMembership(subSubSpace.id)} journeyTypeName="subsubspace" />
        ))}
      </Gutters>
    </GridItem>
  );
};

export default MyMembershipsSubSpace;
