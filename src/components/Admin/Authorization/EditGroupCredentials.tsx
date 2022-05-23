import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential, UserDisplayNameFragment } from '../../../models/graphql-schema';
import EditMembers from '../Community/EditMembers';
import { useAvailableMembers } from '../../../domain/community/useAvailableMembers';

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

  const handleAdd = (_member: UserDisplayNameFragment) => {
    grant({
      variables: {
        input: {
          userID: _member.id,
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

  const handleRemove = (_member: Member) => {
    revoke({
      variables: {
        input: {
          userID: _member.id,
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

  const { available, current, loading, fetchMore, hasMore, setSearchTerm } = useAvailableMembers({
    credential,
    resourceId,
    parentCommunityId,
  });

  return (
    <EditMembers
      members={current}
      availableMembers={available}
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
