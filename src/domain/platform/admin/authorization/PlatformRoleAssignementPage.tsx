import React from 'react';
import EditMemberCredentials from '../components/Authorization/EditMemberCredentials';
import {
  refetchUsersWithCredentialsQuery,
  useAssignPlatformRoleToUserMutation,
  useRemovePlatformRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationCredential, PlatformRole } from '@/core/apollo/generated/graphql-schema';

interface PlatformRoleAssignementPageProps {
  role: PlatformRole;
  authorizationCredential: AuthorizationCredential;
}

const PlatformRoleAssignementPage = ({ authorizationCredential, role }: PlatformRoleAssignementPageProps) => {
  const [assignRole, { loading: addingMember }] = useAssignPlatformRoleToUserMutation();

  const [revokeRole, { loading: removingMember }] = useRemovePlatformRoleFromUserMutation();

  const handleAdd = (memberId: string) => {
    assignRole({
      variables: {
        input: {
          userID: memberId,
          role,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: authorizationCredential },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (memberId: string) => {
    revokeRole({
      variables: {
        input: {
          userID: memberId,
          role,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: authorizationCredential },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  return (
    <EditMemberCredentials
      onAdd={handleAdd}
      onRemove={handleRemove}
      credential={authorizationCredential}
      updating={addingMember || removingMember}
    />
  );
};

export default PlatformRoleAssignementPage;
