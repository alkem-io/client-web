import { Container } from '@mui/material';
import React, { FC } from 'react';

import EditMemberCredentials from '../../../platform/admin/components/Authorization/EditMemberCredentials';
import { Loading } from '../../../../common/components/core';
import { useSpace } from '../SpaceContext/useSpace';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsSpaceAdminMutation,
  useRemoveUserAsSpaceAdminMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';

interface SpaceAuthorizationViewProps {
  credential: AuthorizationCredential;
  resourceId: string | undefined;
}
/**
 * @deprecated - Temporarily moved here because on the next sprint we are going to join this component to chose Space admins
 * with the Community Tab's components. The rest of the elements in the SpaceAuthorizationView have been moved to other places or removed
 */
const SpaceAuthorizationView: FC<SpaceAuthorizationViewProps> = ({ credential, resourceId = '' }) => {
  const [grant, { loading: addingMember }] = useAssignUserAsSpaceAdminMutation({});

  const [revoke, { loading: removingMember }] = useRemoveUserAsSpaceAdminMutation({});

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
          spaceID: resourceId,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: credential, resourceID: resourceId },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (memberId: string) => {
    revoke({
      variables: {
        input: {
          userID: memberId,
          spaceID: resourceId,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: credential, resourceID: resourceId },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  const { communityId, loading: loadingSpace } = useSpace();

  if (loadingSpace) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      <EditMemberCredentials
        onAdd={handleAdd}
        onRemove={handleRemove}
        resourceId={resourceId}
        credential={credential}
        parentCommunityId={communityId}
        updating={addingMember || removingMember}
        title="Space Admins"
      />
    </Container>
  );
};

export default SpaceAuthorizationView;
