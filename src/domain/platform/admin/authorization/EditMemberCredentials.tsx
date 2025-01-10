import React, { FC } from 'react';
import { useUserContext } from '@/domain/community/user';
import EditMemberUsers, { EditMemberUsersProps } from '../components/Community/EditMembersUsers';
import { useAvailableMembersWithCredential } from '@/domain/access/removeMe/useAvailableMembersWithCredential/useAvailableMembersWithCredential';

interface EditAdminCredentialsProps extends Pick<EditMemberUsersProps, 'onAdd' | 'onRemove' | 'updating'> {
  /** Members of the edited entity */
  roleSetId?: string;
  title?: string;
}

export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({
  onAdd,
  onRemove,
  title,
  roleSetId,
  updating,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { availableMembers, currentMembers, loading, hasMore, setSearchTerm } = useAvailableMembersWithCredential({
    roleSetId,
  });

  return (
    <EditMemberUsers
      members={currentMembers}
      availableMembers={availableMembers}
      executorId={user?.id}
      onAdd={onAdd}
      onRemove={onRemove}
      updating={updating}
      loadingMembers={loading}
      loadingAvailableMembers={loading}
      onSearchTermChange={setSearchTerm}
      hasMore={hasMore}
      title={title}
    />
  );
};

export default EditMemberCredentials;
