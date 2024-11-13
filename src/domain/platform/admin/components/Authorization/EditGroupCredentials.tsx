import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '@core/apollo/generated/apollo-hooks';
import { AuthorizationCredential } from '@core/apollo/generated/graphql-schema';
import EditMemberUsers from '../Community/EditMembersUsers';
import { useAvailableMembersWithCredential } from '../../../../community/community/useAvailableMembersWithCredential/useAvailableMembersWithCredential';

interface EditCredentialsProps {
  credential: GroupCredentials;
  resourceId: string;
  parentCommunityId?: string;
}

export type GroupCredentials = AuthorizationCredential.UserGroupMember;

export const EditCredentials: FC<EditCredentialsProps> = ({ credential, parentCommunityId, resourceId }) => {
  const [grant, { loading: addingMember }] = useAssignUserToGroupMutation({});

  const [revoke, { loading: removingMember }] = useRemoveUserFromGroupMutation({});

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
      updating={addingMember || removingMember}
      onRemove={handleRemove}
      loadingMembers={loading}
      loadingAvailableMembers={loading}
      fetchMore={fetchMore}
      hasMore={hasMore}
      onSearchTermChange={setSearchTerm}
    />
  );
};

export default EditCredentials;
