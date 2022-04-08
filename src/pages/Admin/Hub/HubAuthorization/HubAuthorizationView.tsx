import { Container } from '@mui/material';
import React, { FC } from 'react';

import EditMemberCredentials from '../../../../components/Admin/Authorization/EditMemberCredentials';
import { Loading } from '../../../../components/core';
import { useApolloErrorHandler, useHub } from '../../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsHubAdminMutation,
  useRemoveUserAsHubAdminMutation,
} from '../../../../hooks/generated/graphql';
import { Member } from '../../../../models/User';
import { AuthorizationCredential, UserDisplayNameFragment } from '../../../../models/graphql-schema';

interface HubAuthorizationViewProps {
  credential: AuthorizationCredential;
  resourceId: string | undefined;
}

const HubAuthorizationView: FC<HubAuthorizationViewProps> = ({ credential, resourceId = '' }) => {
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsHubAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsHubAdminMutation({
    onError: handleError,
  });

  const handleAdd = (member: UserDisplayNameFragment) => {
    grant({
      variables: {
        input: {
          userID: member.id,
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

  const handleRemove = (member: Member) => {
    revoke({
      variables: {
        input: {
          userID: member.id,
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
        addingMember={addingMember}
        removingMember={removingMember}
      />
    </Container>
  );
};
export default HubAuthorizationView;
