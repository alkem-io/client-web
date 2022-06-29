import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import EditMemberUsers from '../Community/EditMembersUsers';
import { useAvailableMembersWithCredential } from '../../../domain/community/useAvailableMembersWithCredential';

interface EditCredentialsProps {
  credential: GroupCredentials;
  resourceId: string;
  parentCommunityId?: string;
}

export type GroupCredentials = AuthorizationCredential.UserGroupMember;

export const EditCredentials: FC<EditCredentialsProps> = ({ credential, parentCommunityId, resourceId }) => {
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserToGroupMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserFromGroupMutation({
    onError: handleError,
  });

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
          groupID: resourceId,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: credential, resourceID: resourceId },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (memberId: string) => {
    revoke({
      variables: {
        input: {
          userID: memberId,
          groupID: resourceId,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: credential, resourceID: resourceId },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  const { availableMembers, currentMembers, loading, fetchMore, hasMore, setSearchTerm } =
    useAvailableMembersWithCredential({
      credential,
      resourceId,
      parentCommunityId,
    });

  return (
    <EditMemberUsers
      members={currentMembers}
      availableMembers={availableMembers}
      onAdd={handleAdd}
      addingMember={addingMember}
      onRemove={handleRemove}
      removingMember={removingMember}
      loadingMembers={loading}
      loadingAvailableMembers={loading}
      fetchMore={fetchMore}
      hasMore={hasMore}
      onSearchTermChange={setSearchTerm}
    />
  );
};

export default EditCredentials;
