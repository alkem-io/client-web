import React, { FC, useState } from 'react';
import { useAvailableMembers2, useUserContext } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { EditMembers2, EditMembersProps } from '../Community/EditMembers2';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove' | 'addingMember' | 'removingMember'> {
  credential: AuthorizationCredential;
  /** Members of the edited entity */
  parentCommunityId?: string;
  title?: string;
}

export const EditMemberCredentials2: FC<EditAdminCredentialsProps> = ({
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

  const [filterTerm, setFilterTerm] = useState<string>();

  const onFilter = (term: string) => setFilterTerm(term);

  const { available, current, loading, onLoadMore, isLastAvailableUserPage } = useAvailableMembers2(
    credential,
    resourceId,
    parentCommunityId,
    undefined,
    { firstName: filterTerm, lastName: filterTerm, email: filterTerm }
  );

  return (
    <EditMembers2
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
      onFilter={onFilter}
      lastMembersPage={isLastAvailableUserPage}
      title={title}
    />
  );
};

export default EditMemberCredentials2;
