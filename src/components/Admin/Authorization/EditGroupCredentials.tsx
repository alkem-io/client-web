import React, { FC, useMemo } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
  useUsersQuery,
  useUsersWithCredentialsQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Loading } from '../../core';
import { EditMembers } from '../Community/EditMembers';

interface EditCredentialsProps {
  credential: GroupCredentials;
  resourceId: string;
  parentMembers?: Member[];
}

export type GroupCredentials = AuthorizationCredential.UserGroupMember;

export const EditCredentials: FC<EditCredentialsProps> = ({ credential, parentMembers, resourceId }) => {
  const { data, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });

  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);
  const handleError = useApolloErrorHandler();

  const [grant] = useAssignUserToGroupMutation({
    onError: handleError,
  });

  const [revoke] = useRemoveUserFromGroupMutation({
    onError: handleError,
  });

  const { data: usersInfo, loading: loadingUsers } = useUsersQuery({
    fetchPolicy: 'cache-and-network',
    skip: parentMembers != null,
  });
  const allUsers = usersInfo?.users || [];

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

  const availableMembers = useMemo(() => {
    return (parentMembers || allUsers).filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, data]);

  if (loadingMembers || loadingUsers) {
    return <Loading />;
  }

  return (
    <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
  );
};
export default EditCredentials;
