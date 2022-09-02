import { Container } from '@mui/material';
import React, { FC } from 'react';

import EditMemberCredentials from '../../../admin/components/Authorization/EditMemberCredentials';
import { Loading } from '../../../../common/components/core';
import { useApolloErrorHandler, useChallenge } from '../../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsChallengeAdminMutation,
  useRemoveUserAsChallengeAdminMutation,
} from '../../../../hooks/generated/graphql';
import { AuthorizationCredential } from '../../../../models/graphql-schema';

interface ChallengeAuthorizationViewProps {
  credential: AuthorizationCredential;
  resourceId: string | undefined;
}

const ChallengeAuthorizationView: FC<ChallengeAuthorizationViewProps> = ({ credential, resourceId = '' }) => {
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsChallengeAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsChallengeAdminMutation({
    onError: handleError,
  });

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
          challengeID: resourceId,
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
          challengeID: resourceId,
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

  const { challenge, loading: loadingChallenge } = useChallenge();
  const communityId = challenge?.community?.id || '';

  if (loadingChallenge) {
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
        title="Challenge Admins"
      />
    </Container>
  );
};
export default ChallengeAuthorizationView;
