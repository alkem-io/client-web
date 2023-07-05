import { Container } from '@mui/material';
import React, { FC } from 'react';
import EditMemberCredentials from '../../../../platform/admin/components/Authorization/EditMemberCredentials';
import { Loading } from '../../../../../common/components/core';
import { useChallenge } from '../../hooks/useChallenge';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsChallengeAdminMutation,
  useRemoveUserAsChallengeAdminMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential, CommunityRole } from '../../../../../core/apollo/generated/graphql-schema';

interface ChallengeAuthorizationViewProps {
  credential: AuthorizationCredential;
  resourceId: string | undefined;
}

const ChallengeAuthorizationView: FC<ChallengeAuthorizationViewProps> = ({ credential, resourceId = '' }) => {
  const [grant, { loading: addingMember }] = useAssignUserAsChallengeAdminMutation({});

  const [revoke, { loading: removingMember }] = useRemoveUserAsChallengeAdminMutation({});

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
          communityID: resourceId, // TODO: fix the value passed in
          role: CommunityRole.Admin,
        },
      },
      // TODO: this also needs to be refactored to use the updated roles based query on community
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
          communityID: resourceId, // TODO: fix the value passed in
          role: CommunityRole.Admin,
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
