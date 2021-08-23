import React, { FC, useMemo } from 'react';
import { useApolloErrorHandler, useEcoverse, useUpdateNavigation } from '../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsEcoverseAdminMutation,
  useEcoverseMembersQuery,
  useRemoveUserAsEcoverseAdminMutation,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import AuthorizationPageProps from '../AuthorizationPageProps';
import { useParams, useRouteMatch } from 'react-router';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import EditMemberCredentials from '../../../components/Admin/Authorization/EditMemberCredentials';
import { Container } from '@material-ui/core';
import { Loading } from '../../../components/core';

interface Params {
  role: AuthorizationCredential;
}

const EcoverseAuthorizationPage: FC<AuthorizationPageProps> = ({ paths, resourceId = '' }) => {
  const { url } = useRouteMatch();
  const { role: credential } = useParams<Params>();
  const currentPaths = useMemo(() => [...paths, { value: url, name: credential, real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [grant] = useAssignUserAsEcoverseAdminMutation({
    onError: handleError,
  });

  const [revoke] = useRemoveUserAsEcoverseAdminMutation({
    onError: handleError,
  });

  const handleAdd = (member: Member) => {
    grant({
      variables: {
        input: {
          userID: member.id,
          ecoverseID: resourceId,
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
          ecoverseID: resourceId,
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
export default EcoverseAuthorizationPage;
