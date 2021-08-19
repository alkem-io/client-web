import React, { FC, useMemo } from 'react';
import { useEcoverseMembersQuery, useUsersWithCredentialsQuery } from '../../../hooks/generated/graphql';
import { Loading } from '../../core';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { useEcoverse, useUserContext } from '../../../hooks';

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
    skip: !Boolean(resourceId),
  });
  const members = useMemo(() => usersWithCredentials?.usersWithAuthorizationCredential || [], [usersWithCredentials]);

  const { ecoverseId } = useEcoverse();
  const { data: membersQuery, loading: loadingEcoMembers } = useEcoverseMembersQuery({
    variables: { ecoverseId: ecoverseId },
  });
  const ecoMembers = membersQuery?.ecoverse?.community?.members || [];

  const availableMembers = useMemo(
    () => ecoMembers.filter(p => members.findIndex(m => m.id === p.id) === -1),
    [ecoMembers, usersWithCredentials]
  );

  if (loadingMembers || loadingEcoMembers) {
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
