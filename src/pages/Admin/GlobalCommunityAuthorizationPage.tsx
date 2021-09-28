import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { Container } from '@material-ui/core';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsGlobalCommunityAdminMutation,
  useRemoveUserAsGlobalCommunityAdminMutation,
  useUsersQuery,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler, useUpdateNavigation, useUrlParams } from '../../hooks';
import { Member } from '../../models/User';
import EditMemberCredentials from '../../components/Admin/Authorization/EditMemberCredentials';
import AuthorizationPageProps from './AuthorizationPageProps';
import { Loading } from '../../components/core';
import { useTranslation } from 'react-i18next';

const GlobalCommunityAuthorizationPage: FC<AuthorizationPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const { role: credential } = useUrlParams();
  const currentPaths = useMemo(
    () => [
      ...paths,
      { value: url, name: t(`common.enums.authorization-credentials.${credential}.name` as const), real: true },
    ],
    [paths]
  );

  useUpdateNavigation({ currentPaths });
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsGlobalCommunityAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsGlobalCommunityAdminMutation({
    onError: handleError,
  });

  const handleAdd = (member: Member) => {
    grant({
      variables: {
        input: {
          userID: member.id,
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

  const { data, loading } = useUsersQuery();
  const members = data?.users || [];

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      <EditMemberCredentials
        onAdd={handleAdd}
        onRemove={handleRemove}
        credential={credential}
        memberList={members}
        addingMember={addingMember}
        removingMember={removingMember}
      />
    </Container>
  );
};
export default GlobalCommunityAuthorizationPage;
