import React, { FC } from 'react';
import { useUserContext } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import AuthorizationPageProps from '../../../pages/Admin/AuthorizationPageProps';
import { EditMembers, EditMembersProps } from '../Community/EditMembers';
import useAvailableMembersWithFilter from '../../../domain/community/useAvailableMembers/useAvailableMembersWithFilter';

interface EditAdminCredentialsProps
  extends Omit<AuthorizationPageProps, 'paths'>,
    Pick<EditMembersProps, 'onAdd' | 'onRemove' | 'addingMember' | 'removingMember'> {
  credential: AuthorizationCredential;
  /** Members of the edited entity */
  parentCommunityId?: string;
  title?: string;
}
// todo: merge with EditMemberCredentials when pagination and filtering is stable
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

  const { available, current, loading, fetchMore, hasMore, onFilter } = useAvailableMembersWithFilter({
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
      onLoadMore={fetchMore}
      onFilter={onFilter}
      hasMore={hasMore}
      title={title}
    />
  );
};

export default EditMemberCredentials2;
