import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsSimpleListQuery,
  useAssignUserAsCommunityMemberMutation,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import EditMembers from '../Community/EditMembers';
import { WithCommunity } from '../Community/CommunityTypes';
import { useAvailableMembersWithCredential } from '../../../domain/community/useAvailableMembersWithCredential';

interface EditCredentialsProps extends WithCommunity {
  resourceId: string;
  communityId: string;
  credential: CommunityCredentials;
}

export type CommunityCredentials =
  | AuthorizationCredential.HubMember
  | AuthorizationCredential.OpportunityMember
  | AuthorizationCredential.OrganizationMember
  | AuthorizationCredential.ChallengeMember;

export const EditCommunityMembers: FC<EditCredentialsProps> = ({
  credential,
  resourceId,
  communityId,
  parentCommunityId,
}) => {
  const handleError = useApolloErrorHandler();

  const [add, { loading: addingMember }] = useAssignUserAsCommunityMemberMutation({
    onError: handleError,
  });

  const [remove, { loading: removingMember }] = useRemoveUserAsCommunityMemberMutation({
    onError: handleError,
  });

  const onAdd = (memberId: string) =>
    add({
      variables: {
        communityId,
        memberId,
      },
      refetchQueries: [
        refetchUsersWithCredentialsSimpleListQuery({
          input: { type: credential, resourceID: resourceId },
        }),
      ],
      awaitRefetchQueries: true,
    });

  const onRemove = (memberId: string) =>
    remove({
      variables: {
        memberId,
        communityId,
      },
      refetchQueries: [
        refetchUsersWithCredentialsSimpleListQuery({
          input: { type: credential, resourceID: resourceId },
        }),
      ],
      awaitRefetchQueries: true,
    });

  const { availableMembers, currentMembers, loading, fetchMore, hasMore, setSearchTerm } =
    useAvailableMembersWithCredential({
      credential,
      resourceId,
      parentCommunityId,
    });

  return (
    <EditMembers
      existingUsers={currentMembers}
      availableUsers={availableMembers}
      onAdd={onAdd}
      addingMember={addingMember}
      onRemove={onRemove}
      removingMember={removingMember}
      loadingMembers={loading}
      loadingAvailableMembers={loading}
      fetchMore={fetchMore}
      hasMore={hasMore}
      onSearchTermChange={setSearchTerm}
    />
  );
};

export default EditCommunityMembers;
