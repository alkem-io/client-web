import React, { FC, useState } from 'react';
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

  const [filterTerm, setFilterTerm] = useState('');

  const { available, current, loading, fetchMore, hasMore } = useAvailableMembers({
    credential,
    resourceId,
    parentCommunityId,
    filter: { firstName: filterTerm, lastName: filterTerm, email: filterTerm },
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
      onFilter={setFilterTerm}
      hasMore={hasMore}
      title={title}
    />
  );
};

export default EditMemberCredentials;
