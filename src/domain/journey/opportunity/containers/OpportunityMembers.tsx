import React, { FC, useMemo } from 'react';
import { useUserContext } from '../../../community/user';
import {
  AuthorizationCredential,
  Community,
  Opportunity,
  UserDisplayNameFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { Member } from '../../../community/user/models/User';
import {
  useAvailableMembersWithCredential,
  AvailableMembersResults,
} from '../../../community/community/useAvailableMembersWithCredential';

export type AuthorizationCredentials = AuthorizationCredential.SubspaceAdmin | AuthorizationCredential.SubspaceMember;

export interface OpportunityMembersProps {
  entities: {
    opportunityId: Opportunity['id'];
    communityId?: Community['id']; // TODO: this should not be optional to carry out the role assignments
    credential: AuthorizationCredentials;
  };
  children: (
    entities: OpportunityMembersEntities,
    actions: OpportunityMembersActions,
    state: OpportunityMembersState
  ) => React.ReactNode;
}

export interface OpportunityMembersActions {
  handleLoadMore: () => Promise<void>;
  setSearchTerm: AvailableMembersResults['setSearchTerm'];
}

export interface OpportunityMembersState {
  loading: boolean;
  hasMoreUsers: boolean | undefined;
}

export interface OpportunityMembersEntities {
  availableMembers: UserDisplayNameFragment[];
  allMembers: Member[];
  currentMember?: Member;
}

export const OpportunityMembers: FC<OpportunityMembersProps> = ({ children, entities }) => {
  const { user } = useUserContext();
  const { communityId } = entities;

  const {
    availableMembers,
    currentMembers: allMembers,
    loading,
    fetchMore,
    hasMore,
    setSearchTerm,
  } = useAvailableMembersWithCredential({
    credential: entities.credential,
    resourceId: entities.subsubspaceId,
    parentCommunityId: communityId,
  });

  const handleLoadMore = fetchMore;

  const currentMember = useMemo<Member | undefined>(() => {
    if (user)
      return {
        id: user.user.id,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        email: user.user.email,
        profile: {
          id: user.user.profile.id,
          displayName: user.user.profile.displayName,
        },
      };
  }, [user]);

  return (
    <>
      {children(
        { availableMembers, allMembers, currentMember },
        {
          handleLoadMore,
          setSearchTerm,
        },
        {
          loading,
          hasMoreUsers: hasMore,
        }
      )}
    </>
  );
};

export default OpportunityMembers;
