import React, { FC, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import { Container } from '@material-ui/core';
import {
  refetchUsersWithCredentialsQuery,
  useGrantCredentialsMutation,
  useRevokeCredentialsMutation,
} from '../../hooks/generated/graphql';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { useApolloErrorHandler, useUpdateNavigation } from '../../hooks';
import { Member } from '../../models/User';
import EditMemberCredentials from '../../components/Admin/Authorization/EditMemberCredentials';
import AuthorizationPageProps from './AuthorizationPageProps';

interface Params {
  role: AuthorizationCredential;
}

const GlobalAuthorizationPage: FC<AuthorizationPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { role: credential } = useParams<Params>();
  const currentPaths = useMemo(() => [...paths, { value: url, name: credential, real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [grant] = useGrantCredentialsMutation({
    onError: handleError,
  });

  const [revoke] = useRevokeCredentialsMutation({
    onError: handleError,
  });

  const handleAdd = (member: Member) => {
    grant({
      variables: {
        input: {
          userID: member.id,
          type: credential,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: credential },
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
          type: credential,
        },
      },
      refetchQueries: [
        refetchUsersWithCredentialsQuery({
          input: { type: credential },
        }),
      ],
      awaitRefetchQueries: true,
    });
  };

  return (
    <Container maxWidth="xl">
      <EditMemberCredentials onAdd={handleAdd} onRemove={handleRemove} credential={credential} />
    </Container>
  );
};
export default GlobalAuthorizationPage;
