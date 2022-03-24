import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useAvailableMembers } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential, UserDisplayNameFragment } from '../../../models/graphql-schema';
import { EditMembers } from '../Community/EditMembers';

interface EditCredentialsProps {
  credential: GroupCredentials;
  resourceId: string;
  parentMembers?: Member[];
  parentCommunityId?: string;
}

export type GroupCredentials = AuthorizationCredential.UserGroupMember;

export const EditCredentials: FC<EditCredentialsProps> = ({
  credential,
  parentCommunityId,
  resourceId,
  parentMembers,
}) => {
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

  const { available, current, loading, onLoadMore, isLastAvailableUserPage } = useAvailableMembers(
    credential,
    resourceId,
    parentCommunityId,
    parentMembers,
    3
  );

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
      onLoadMore={onLoadMore}
      lastMembersPage={isLastAvailableUserPage}
    />
  );
};
export default EditCredentials;
