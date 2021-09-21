import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useAvailableMembers } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { EditMembers } from '../Community/EditMembers';

interface EditCredentialsProps {
  credential: GroupCredentials;
  resourceId: string;
  parentMembers?: Member[];
}

export type GroupCredentials = AuthorizationCredential.UserGroupMember;

export const EditCredentials: FC<EditCredentialsProps> = ({ credential, parentMembers, resourceId }) => {
  const handleError = useApolloErrorHandler();

  const [grant] = useAssignUserToGroupMutation({
    onError: handleError,
  });

  const [revoke] = useRemoveUserFromGroupMutation({
    onError: handleError,
  });

  const handleAdd = (_member: Member) => {
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

  const { available, current, loading } = useAvailableMembers(credential, resourceId, parentMembers);

  return (
    <EditMembers
      members={current}
      availableMembers={available}
      onAdd={handleAdd}
      addingMember={loading}
      onRemove={handleRemove}
      removingMember={loading}
      loadingMembers={loading}
      loadingAvailalbeMembers={loading}
    />
  );
};
export default EditCredentials;
