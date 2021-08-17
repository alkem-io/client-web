import React, { FC, useMemo } from 'react';
import { useUsersQuery, useUsersWithCredentialsQuery } from '../../../hooks/generated/graphql';
import { Loading } from '../../core';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { useUserContext } from '../../../hooks';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove'> {
  credential: AuthorizationCredential;
}

export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({ onAdd, onRemove, credential, resourceId }) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { data: usersWithCredentials, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });

  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();
  // todo: allMembers should be members of the editing entity only
  const allMembers = useMemo(() => usersInfo?.users || [], [usersInfo]);

  const members = useMemo(() => usersWithCredentials?.usersWithAuthorizationCredential || [], [usersWithCredentials]);
  const availableMembers = useMemo(
    () => allMembers.filter(p => members.findIndex(m => m.id === p.id) === -1),
    [allMembers, usersWithCredentials]
  );

  if (loadingMembers || loadingUsers) {
    return <Loading />;
  }

  return (
    <EditMembers
      members={members}
      availableMembers={availableMembers}
      executor={user}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
};

export default EditMemberCredentials;
