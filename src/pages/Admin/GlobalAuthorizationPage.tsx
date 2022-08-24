import { Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import EditMemberCredentials from '../../components/Admin/Authorization/EditMemberCredentials';
import AdminLayout from '../../domain/admin/toplevel/AdminLayout';
import { AdminSection } from '../../domain/admin/toplevel/constants';
import { useApolloErrorHandler, useUpdateNavigation, useUrlParams } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsGlobalAdminMutation,
  useRemoveUserAsGlobalAdminMutation,
} from '../../hooks/generated/graphql';
import { AuthorizationCredential } from '../../models/graphql-schema';
import AuthorizationPageProps from './AuthorizationPageProps';

const GlobalAuthorizationPage: FC<AuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');
  // TODO Needs refactor. If credential is missing page should not be rendered or error should be shown.
  const { role: credential = AuthorizationCredential.GlobalRegistered } = useUrlParams();
  const currentPaths = useMemo(
    () => [
      ...paths,
      { value: url, name: t(`common.enums.authorization-credentials.${credential}.name` as const), real: true },
    ],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsGlobalAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsGlobalAdminMutation({
    onError: handleError,
  });

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
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

  const handleRemove = (memberId: string) => {
    revoke({
      variables: {
        input: {
          userID: memberId,
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
    <AdminLayout currentTab={AdminSection.Authorization}>
      <Container maxWidth="xl">
        <EditMemberCredentials
          onAdd={handleAdd}
          onRemove={handleRemove}
          credential={credential}
          updating={addingMember || removingMember}
        />
      </Container>
    </AdminLayout>
  );
};
export default GlobalAuthorizationPage;
