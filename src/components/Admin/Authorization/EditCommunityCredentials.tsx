import React, { FC, useMemo } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToCommunityMutation,
  useRemoveUserFromCommunityMutation,
  useUsersQuery,
  useUsersWithCredentialsQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Loading } from '../../core';
import { EditMembers } from '../Community/EditMembers';

interface EditCredentialsProps {
  resourceId: string;
  communityId: string;
  parentMembers?: Member[];
  credential: CommunityCredentials;
}

export type CommunityCredentials =
  | AuthorizationCredential.EcoverseMember
  | AuthorizationCredential.OpportunityMember
  | AuthorizationCredential.OrganisationMember
  | AuthorizationCredential.ChallengeMember;

export const EditCredentials: FC<EditCredentialsProps> = ({ parentMembers, credential, resourceId, communityId }) => {
  const { data, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });

  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);
  const handleError = useApolloErrorHandler();

  const [grant] = useAssignUserToCommunityMutation({
    onError: handleError,
  });

  const [revoke] = useRemoveUserFromCommunityMutation({
    onError: handleError,
  });

  const { data: usersInfo, loading: loadingUsers } = useUsersQuery({
    fetchPolicy: 'cache-and-network',
    skip: parentMembers != null,
  });
  const allUsers = usersInfo?.users || [];

  const handleAdd = (_member: Member) => {
    grant({
      variables: {
        input: {
          communityID: communityId,
          userID: _member.id,
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

  const handleRemove = (_member: Member) => {
    revoke({
      variables: {
        input: {
          userID: _member.id,
          communityID: communityId,
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

  const availableMembers = useMemo(() => {
    return (parentMembers || allUsers).filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, data]);

  if (loadingMembers || loadingUsers) {
    return <Loading />;
  }

  return (
    <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
  );
};
export default EditCredentials;
