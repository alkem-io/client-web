import React, { FC, useMemo } from 'react';
import { useUsersWithCredentialsQuery } from '../../../hooks/generated/graphql';
import { Loading } from '../../core';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { useUserContext } from '../../../hooks';
import { Member } from '../../../models/User';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove'> {
  credential: AuthorizationCredential;
  /** Members of the edited entity */
  memberList: Member[];
}

export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({
  onAdd,
  onRemove,
  credential,
  resourceId,
  memberList,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { data, loading } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });
  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);
  const availableMembers = useMemo(
    () => memberList.filter(p => members.findIndex(m => m.id === p.id) === -1),
    [memberList]
  );

  if (loading) {
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
