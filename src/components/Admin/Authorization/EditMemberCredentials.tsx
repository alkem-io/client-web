import React, { FC } from 'react';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { useUserContext, useAvailableMembers } from '../../../hooks';
import { Member } from '../../../models/User';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove' | 'addingMember' | 'removingMember'> {
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
  addingMember = false,
  removingMember = false,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { available, current, loading } = useAvailableMembers(credential, resourceId, memberList);

  return (
    <EditMembers
      members={current}
      availableMembers={available}
      executor={user}
      onAdd={onAdd}
      onRemove={onRemove}
      addingMember={addingMember}
      removingMember={removingMember}
      loadingMembers={loading}
      loadingAvailableMembers={loading}
    />
  );
};

export default EditMemberCredentials;
