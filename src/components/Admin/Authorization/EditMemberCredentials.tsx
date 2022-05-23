import React, { FC } from 'react';
import { useUserContext } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';
import { useAvailableMembers } from '../../../domain/community/useAvailableMembers';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove' | 'addingMember' | 'removingMember'> {
  credential: AuthorizationCredential;
  /** Members of the edited entity */
  parentCommunityId?: string;
  title?: string;
}
export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({
  onAdd,
  onRemove,
  credential,
  resourceId,
  title,
  parentCommunityId,
  addingMember = false,
  removingMember = false,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { available, current, loading, fetchMore, hasMore, setSearchTerm } = useAvailableMembers({
    credential,
    resourceId,
    parentCommunityId,
  });

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
      fetchMore={fetchMore}
      onFilter={setSearchTerm}
      hasMore={hasMore}
      title={title}
    />
  );
};

export default EditMemberCredentials;
