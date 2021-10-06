import React, { FC, useCallback, useMemo } from 'react';
import { useApolloErrorHandler, useAvailableMembers, useUserContext } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsOpportunityAdminMutation,
  useRemoveUserAsOpportunityAdminMutation,
} from '../../hooks/generated/graphql';
import { AuthorizationCredential, Community, Opportunity } from '../../models/graphql-schema';
import { Member } from '../../models/User';

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
  handleAssignAdmin: (member: Member) => void;
  handleRemoveAdmin: (member: Member) => void;
}

export interface OpportunityMembersState {
  addingAdmin: boolean;
  removingAdmin: boolean;
  loading: boolean;
}

export interface OpportunityMembersEntities {
  availableMembers: Member[];
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
    (_member: Member) => {
      grantAdmin({
        variables: {
          input: {
            opportunityID: entities.opportunityId,
            userID: _member.id,
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
    (_member: Member) => {
      revokeAdmin({
        variables: {
          input: {
            userID: _member.id,
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
    available: availableMembers,
    current: allMembers,
    loading,
  } = useAvailableMembers(entities.credential, entities.opportunityId, communityId);

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
        },
        {
          addingAdmin,
          removingAdmin,
          loading: loading,
        }
      )}
    </>
  );
};
export default OpportunityMembers;
