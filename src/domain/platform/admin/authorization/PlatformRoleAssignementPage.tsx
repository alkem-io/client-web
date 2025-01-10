import React from 'react';
import EditMemberCredentials from '../components/Authorization/EditMemberCredentials';
import {
  useAssignPlatformRoleToUserMutation,
  useRemovePlatformRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

interface PlatformRoleAssignementPageProps {
  role: RoleName;
}

const PlatformRoleAssignementPage = ({ role }: PlatformRoleAssignementPageProps) => {
  const [assignRole, { loading: addingMember }] = useAssignPlatformRoleToUserMutation();

  const [revokeRole, { loading: removingMember }] = useRemovePlatformRoleFromUserMutation();

  const handleAdd = (userId: string) => {
    assignRole({
      variables: {
        roleData: {
          contributorID: userId,
          role,
          roleSetID: '',
        },
      },
      refetchQueries: [
        refetchUsersWithRoleQuery({
          input: { role, roleSetID },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (memberId: string) => {
    revokeRole({
      variables: {
        roleData: {
          contributorID: memberId,
          role,
          roleSetId: '',
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { role, roleSetID },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  return <EditMemberCredentials onAdd={handleAdd} onRemove={handleRemove} updating={addingMember || removingMember} />;
};

export default PlatformRoleAssignementPage;
