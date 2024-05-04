import { Container } from '@mui/material';
import React, { FC } from 'react';
import EditMemberCredentials from '../components/Authorization/EditMemberCredentials';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsGlobalCommunityAdminMutation,
  useRemoveUserAsGlobalCommunityAdminMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AuthorizationPageProps from './AuthorizationPageProps';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';

const GlobalCommunityViewerAuthorizationPage: FC<AuthorizationPageProps> = () => {
  // TODO Needs refactor. If credential is missing page should not be rendered or error should be shown.
  const { role: credential = AuthorizationCredential.GlobalCommunityRead } = useUrlParams();

  const [grant, { loading: addingMember }] = useAssignUserAsGlobalCommunityAdminMutation({});

  const [revoke, { loading: removingMember }] = useRemoveUserAsGlobalCommunityAdminMutation({});

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

export default GlobalCommunityViewerAuthorizationPage;
