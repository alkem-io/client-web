import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import EditMemberCredentials from '../../../components/Admin/Authorization/EditMemberCredentials';
import { Loading } from '../../../components/core';
import { useApolloErrorHandler, useEcoverse, useUpdateNavigation, useUrlParams } from '../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsEcoverseAdminMutation,
  useRemoveUserAsEcoverseAdminMutation,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import AuthorizationPageProps from '../AuthorizationPageProps';
import { UserDisplayNameFragment } from '../../../models/graphql-schema';

const EcoverseAuthorizationPage: FC<AuthorizationPageProps> = ({ paths, resourceId = '' }) => {
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

  const [grant, { loading: addingMember }] = useAssignUserAsEcoverseAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsEcoverseAdminMutation({
    onError: handleError,
  });

  const handleAdd = (member: UserDisplayNameFragment) => {
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

  const { ecoverse, loading: loadingEcoverse } = useEcoverse();
  const communityId = ecoverse?.community?.id || '';

  if (loadingEcoverse) {
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
        addingMember={addingMember}
        removingMember={removingMember}
      />
    </Container>
  );
};
export default EcoverseAuthorizationPage;
