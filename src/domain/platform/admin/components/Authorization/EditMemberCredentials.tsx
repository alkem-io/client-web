import React, { FC } from 'react';
import { useUserContext } from '../../../../community/user';
import { AuthorizationCredential } from '@core/apollo/generated/graphql-schema';
import EditMemberUsers, { EditMemberUsersProps } from '../Community/EditMembersUsers';
import { useAvailableMembersWithCredential } from '../../../../community/community/useAvailableMembersWithCredential/useAvailableMembersWithCredential';

interface EditAdminCredentialsProps extends Pick<EditMemberUsersProps, 'onAdd' | 'onRemove' | 'updating'> {
  credential: AuthorizationCredential;
  /** Members of the edited entity */
  parentCommunityId?: string;
  title?: string;
}

export const EditMemberCredentials: FC<EditAdminCredentialsProps> = ({
  onAdd,
  onRemove,
  credential,
  title,
  parentCommunityId,
  updating,
}) => {
  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const { availableMembers, currentMembers, loading, fetchMore, hasMore, setSearchTerm } =
    useAvailableMembersWithCredential({
      credential,
      parentCommunityId,
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
