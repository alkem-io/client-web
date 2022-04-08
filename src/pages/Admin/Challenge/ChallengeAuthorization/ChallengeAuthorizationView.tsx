import { Container } from '@mui/material';
import React, { FC } from 'react';

import EditMemberCredentials from '../../../../components/Admin/Authorization/EditMemberCredentials';
import { Loading } from '../../../../components/core';
import { useApolloErrorHandler, useChallenge } from '../../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsChallengeAdminMutation,
  useRemoveUserAsChallengeAdminMutation,
} from '../../../../hooks/generated/graphql';
import { Member } from '../../../../models/User';
import { AuthorizationCredential, UserDisplayNameFragment } from '../../../../models/graphql-schema';

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

  const handleAdd = (member: UserDisplayNameFragment) => {
    grant({
      variables: {
        input: {
          userID: member.id,
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

  const handleRemove = (member: Member) => {
    revoke({
      variables: {
        input: {
          userID: member.id,
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
        addingMember={addingMember}
        removingMember={removingMember}
      />
    </Container>
  );
};
export default ChallengeAuthorizationView;
