import { Container } from '@mui/material';
import React, { FC } from 'react';

import EditMemberCredentials from '../../../../platform/admin/components/Authorization/EditMemberCredentials';
import { Loading } from '../../../../../common/components/core';
import { useHub } from '../../HubContext/useHub';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsHubAdminMutation,
  useRemoveUserAsHubAdminMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';

interface HubAuthorizationViewProps {
  credential: AuthorizationCredential;
  resourceId: string | undefined;
}

const HubAuthorizationView: FC<HubAuthorizationViewProps> = ({ credential, resourceId = '' }) => {
  const [grant, { loading: addingMember }] = useAssignUserAsHubAdminMutation({});

  const [revoke, { loading: removingMember }] = useRemoveUserAsHubAdminMutation({});

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
          hubID: resourceId,
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
          hubID: resourceId,
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

  const { communityId, loading: loadingHub } = useHub();

  if (loadingHub) {
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
        title="Hub Admins"
      />
    </Container>
  );
};

export default HubAuthorizationView;
