import React, { FC, useMemo } from 'react';
import { useApolloErrorHandler, useEcoverse, useUpdateNavigation, useUrlParams } from '../../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsEcoverseAdminMutation,
  useCommunityMembersQuery,
  useRemoveUserAsEcoverseAdminMutation,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import AuthorizationPageProps from '../AuthorizationPageProps';
import { useRouteMatch } from 'react-router';
import EditMemberCredentials from '../../../components/Admin/Authorization/EditMemberCredentials';
import { Container } from '@material-ui/core';
import { Loading } from '../../../components/core';

const EcoverseAuthorizationPage: FC<AuthorizationPageProps> = ({ paths, resourceId = '' }) => {
  const { url } = useRouteMatch();
  const { role: credential } = useUrlParams();
  const currentPaths = useMemo(() => [...paths, { value: url, name: credential, real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserAsEcoverseAdminMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserAsEcoverseAdminMutation({
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

  const { ecoverse, loading: loadingEcoverse } = useEcoverse();
  const communityId = ecoverse?.community?.id || '';

  const { data, loading: loadingCommunity } = useCommunityMembersQuery({
    variables: { communityId: communityId },
    skip: !communityId,
  });
  const ecoMembers = data?.community?.members || [];

  if (loadingEcoverse || loadingCommunity) {
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
        addingMember={addingMember}
        removingMember={removingMember}
      />
    </Container>
  );
};
export default EcoverseAuthorizationPage;
