import React, { FC } from 'react';
import { useUserContext } from '@/domain/community/user';
import EditMemberUsers, { EditMemberUsersProps } from '../components/Community/EditMembersUsers';
import { useAvailableMembersWithCredential } from '@/domain/access/removeMe/useAvailableMembersWithCredential/useAvailableMembersWithCredential';

interface EditAdminCredentialsProps extends Pick<EditMemberUsersProps, 'onAdd' | 'onRemove' | 'updating'> {
  /** Members of the edited entity */
  parentCommunityId?: string;
  title?: string;
}

export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({
  onAdd,
  onRemove,
  title,
  parentCommunityId,
  updating,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { availableMembers, currentMembers, loading, fetchMore, hasMore, setSearchTerm } =
    useAvailableMembersWithCredential({
      credential,
      parentRoleSetId: parentCommunityId,
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
      fetchMore={fetchMore}
      onSearchTermChange={setSearchTerm}
      hasMore={hasMore}
      title={title}
    />
  );
};

export default EditMemberCredentials;
