import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { Container } from '@material-ui/core';
import { useApolloErrorHandler, useEcoverse, useUpdateNavigation, useUrlParams } from '../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsChallengeAdminMutation,
  useEcoverseMembersQuery,
  useRemoveUserAsChallengeAdminMutation,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import AuthorizationPageProps from '../AuthorizationPageProps';
import EditMemberCredentials from '../../../components/Admin/Authorization/EditMemberCredentials';
import { Loading } from '../../../components/core';

const ChallengeAuthorizationPage: FC<AuthorizationPageProps> = ({ paths, resourceId = '' }) => {
  const { url } = useRouteMatch();
  const { role: credential } = useUrlParams();
  const currentPaths = useMemo(() => [...paths, { value: url, name: credential, real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [grant] = useAssignUserAsChallengeAdminMutation({
    onError: handleError,
  });

  const [revoke] = useRemoveUserAsChallengeAdminMutation({
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

  const { ecoverseId } = useEcoverse();
  const { data, loading } = useEcoverseMembersQuery({
    variables: { ecoverseId: ecoverseId },
  });
  const ecoMembers = data?.ecoverse?.community?.members || [];

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      <EditMemberCredentials
        onAdd={handleAdd}
        onRemove={handleRemove}
        resourceId={resourceId}
        credential={credential}
        memberList={ecoMembers}
      />
    </Container>
  );
};
export default ChallengeAuthorizationPage;
