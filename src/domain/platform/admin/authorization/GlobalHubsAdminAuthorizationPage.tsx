import { Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditMemberCredentials from '../components/Authorization/EditMemberCredentials';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsGlobalHubsAdminMutation,
  useRemoveUserAsGlobalHubsAdminMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AuthorizationPageProps from './AuthorizationPageProps';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';
import { useResolvedPath } from 'react-router-dom';
import AdminLayout from '../toplevel/AdminLayout';
import { AdminSection } from '../toplevel/constants';

const GlobalHubsAdminAuthorizationPage: FC<AuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');
  // TODO Needs refactor. If credential is missing page should not be rendered or error should be shown.
  const { role: credential = AuthorizationCredential.GlobalAdminHubs } = useUrlParams();
  const currentPaths = useMemo(
    () => [
      ...paths,
      { value: url, name: t(`common.enums.authorization-credentials.${credential}.name` as const), real: true },
    ],
    [paths, url, t, credential]
  );

  useUpdateNavigation({ currentPaths });
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsGlobalHubsAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsGlobalHubsAdminMutation({
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
export default GlobalHubsAdminAuthorizationPage;
