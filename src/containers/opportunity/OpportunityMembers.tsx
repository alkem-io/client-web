import React, { FC, useCallback, useMemo } from 'react';
import { useApolloErrorHandler, useUserContext } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsOpportunityAdminMutation,
  useRemoveUserAsOpportunityAdminMutation,
} from '../../hooks/generated/graphql';
import { AuthorizationCredential, Community, Opportunity, UserDisplayNameFragment } from '../../models/graphql-schema';
import { Member } from '../../models/User';
import {
  useAvailableMembersWithCredential,
  AvailableMembersResults,
} from '../../domain/community/community/useAvailableMembersWithCredential';

const opportunityAdminCredential = AuthorizationCredential.OpportunityAdmin;

export type AuthorizationCredentials =
  | AuthorizationCredential.OpportunityAdmin
  | AuthorizationCredential.OpportunityMember;

export interface OpportunityMembersProps {
  entities: {
    opportunityId: Opportunity['id'];
    communityId?: Community['id'];
    credential: AuthorizationCredentials;
  };
  children: (
    entities: OpportunityMembersEntities,
    actions: OpportunityMembersActions,
    state: OpportunityMembersState
  ) => React.ReactNode;
}

export interface OpportunityMembersActions {
  handleAssignAdmin: (memberId: string) => void;
  handleRemoveAdmin: (memberId: string) => void;
  handleLoadMore: () => Promise<void>;
  setSearchTerm: AvailableMembersResults['setSearchTerm'];
}

export interface OpportunityMembersState {
  addingAdmin: boolean;
  removingAdmin: boolean;
  loading: boolean;
  hasMoreUsers: boolean | undefined;
}

export interface OpportunityMembersEntities {
  availableMembers: UserDisplayNameFragment[];
  allMembers: Member[];
  currentMember?: Member;
}

export const OpportunityMembers: FC<OpportunityMembersProps> = ({ children, entities }) => {
  const handleError = useApolloErrorHandler();
  const { user } = useUserContext();
  const { communityId } = entities;

  const [grantAdmin, { loading: addingAdmin }] = useAssignUserAsOpportunityAdminMutation({
    onError: handleError,
  });

  const [revokeAdmin, { loading: removingAdmin }] = useRemoveUserAsOpportunityAdminMutation({
    onError: handleError,
  });

  const handleAssignAdmin = useCallback(
    (memberId: string) => {
      grantAdmin({
        variables: {
          input: {
            opportunityID: entities.opportunityId,
            userID: memberId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: opportunityAdminCredential, resourceID: entities.opportunityId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleRemoveAdmin = useCallback(
    (memberId: string) => {
      revokeAdmin({
        variables: {
          input: {
            userID: memberId,
            opportunityID: entities.opportunityId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: opportunityAdminCredential, resourceID: entities.opportunityId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const {
    availableMembers,
    currentMembers: allMembers,
    loading,
    fetchMore,
    hasMore,
    setSearchTerm,
  } = useAvailableMembersWithCredential({
    credential: entities.credential,
    resourceId: entities.opportunityId,
    parentCommunityId: communityId,
  });

  const handleLoadMore = fetchMore;

  const currentMember = useMemo<Member | undefined>(() => {
    if (user)
      return {
        id: user.user.id,
        displayName: user.user.displayName,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        email: user.user.email,
      };
  }, [user]);

  return (
    <>
      {children(
        { availableMembers, allMembers, currentMember },
        {
          handleAssignAdmin,
          handleRemoveAdmin,
          handleLoadMore,
          setSearchTerm,
        },
        {
          addingAdmin,
          removingAdmin,
          loading,
          hasMoreUsers: hasMore,
        }
      )}
    </>
  );
};
export default OpportunityMembers;
