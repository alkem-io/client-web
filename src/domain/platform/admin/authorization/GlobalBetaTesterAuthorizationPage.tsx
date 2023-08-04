import { Container } from '@mui/material';
import React, { FC } from 'react';
import EditMemberCredentials from '../components/Authorization/EditMemberCredentials';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsBetaTesterMutation,
  useRemoveUserAsBetaTesterMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';

const GlobalBetaTesterAuthorizationPage: FC = () => {
  // TODO Needs refactor. If credential is missing page should not be rendered or error should be shown.
  const { role: credential = AuthorizationCredential.BetaTester } = useUrlParams();

  const [grant, { loading: addingMember }] = useAssignUserAsBetaTesterMutation({});

  const [revoke, { loading: removingMember }] = useRemoveUserAsBetaTesterMutation({});

  const handleAdd = (memberId: string) => {
    grant({
      variables: {
        input: {
          userID: memberId,
          type: AuthorizationCredential.BetaTester,
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
          type: AuthorizationCredential.BetaTester,
          resourceID: '',
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

export default GlobalBetaTesterAuthorizationPage;
