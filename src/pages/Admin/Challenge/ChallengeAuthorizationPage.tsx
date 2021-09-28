import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { Container } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useChallenge, useUpdateNavigation, useUrlParams } from '../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsChallengeAdminMutation,
  useCommunityMembersQuery,
  useRemoveUserAsChallengeAdminMutation,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import AuthorizationPageProps from '../AuthorizationPageProps';
import EditMemberCredentials from '../../../components/Admin/Authorization/EditMemberCredentials';
import { Loading } from '../../../components/core';

const ChallengeAuthorizationPage: FC<AuthorizationPageProps> = ({ paths, resourceId = '' }) => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const { role: credential } = useUrlParams();
  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: url,
        name: t(`common.enums.authorization-credentials.${credential}.name` as const),
        real: true,
      },
    ],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsChallengeAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsChallengeAdminMutation({
    onError: handleError,
  });

  const handleAdd = (member: Member) => {
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

  const { data, loading: loadingCommunity } = useCommunityMembersQuery({
    variables: { communityId: communityId },
    skip: !communityId,
  });
  const challengeMembers = data?.community?.members || [];

  if (loadingChallenge || loadingCommunity) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      <EditMemberCredentials
        onAdd={handleAdd}
        onRemove={handleRemove}
        resourceId={resourceId}
        credential={credential}
        memberList={challengeMembers}
        addingMember={addingMember}
        removingMember={removingMember}
      />
    </Container>
  );
};
export default ChallengeAuthorizationPage;
