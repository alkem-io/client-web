import React, { FC } from 'react';
import { useAvailableMembers, useUserContext } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove' | 'addingMember' | 'removingMember'> {
  credential: AuthorizationCredential;
  /** Members of the edited entity */
  parentCommunityId?: string;
}

export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({
  onAdd,
  onRemove,
  credential,
  resourceId,
  parentCommunityId,
  addingMember = false,
  removingMember = false,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { available, current, loading, onLoadMore, isLastAvailableUserPage } = useAvailableMembers(
    credential,
    resourceId,
    parentCommunityId,
    undefined,
    3
  );

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
      onLoadMore={onLoadMore}
      lastMembersPage={isLastAvailableUserPage}
    />
  );
};

export default EditMemberCredentials;
