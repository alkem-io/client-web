import React from 'react';
import EditMemberCredentials from './EditMemberCredentials';
import {
  useAssignPlatformRoleToUserMutation,
  useRemovePlatformRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

interface PlatformRoleAssignementPageProps {
  role: RoleName;
  roleSetId: string;
}

const PlatformRoleAssignementPage = ({ role, roleSetId }: PlatformRoleAssignementPageProps) => {
  const [assignRole, { loading: addingMember }] = useAssignPlatformRoleToUserMutation();
  const [revokeRole, { loading: removingMember }] = useRemovePlatformRoleFromUserMutation();

  const handleAdd = (userId: string) => {
    assignRole({
      variables: {
        contributorId: userId,
        role,
        roleSetId,
      },
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (memberId: string) => {
    revokeRole({
      variables: {
        contributorId: memberId,
        role,
        roleSetId,
      },
      awaitRefetchQueries: true,
    });
  };

  return <EditMemberCredentials onAdd={handleAdd} onRemove={handleRemove} updating={addingMember || removingMember} />;
};

export default PlatformRoleAssignementPage;
