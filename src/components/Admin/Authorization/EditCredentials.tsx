import React, { FC, useMemo } from 'react';
import {
  useGrantCredentialsMutation,
  useRevokeCredentialsMutation,
  UsersWithCredentialsDocument,
  useUsersWithCredentialsQuery,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { useCredentialsResolver } from '../../../hooks/useCredentialsResolver';
import { Member } from '../../../models/User';
import Loading from '../../core/Loading';
import { EditMembers } from '../Community/EditMembers';

interface EditCredentialsProps {
  credential: string;
  resourceId?: string;
  parentMembers: Member[];
}

export const EditCredentials: FC<EditCredentialsProps> = ({ credential, parentMembers, resourceId }) => {
  const { toAuthenticationCredentials } = useCredentialsResolver();

  const { data, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: toAuthenticationCredentials(credential),
        resourceID: resourceId,
      },
    },
  });

  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);
  const handleError = useApolloErrorHandler();

  const [grant] = useGrantCredentialsMutation({
    onError: handleError,
  });

  const [revoke] = useRevokeCredentialsMutation({
    onError: handleError,
  });

  const handleAdd = (_member: Member) => {
    grant({
      variables: {
        input: {
          userID: _member.id,
          type: toAuthenticationCredentials(credential),
          resourceID: resourceId,
        },
      },
      refetchQueries: [
        {
          query: UsersWithCredentialsDocument,
          variables: { input: { type: toAuthenticationCredentials(credential), resourceID: resourceId } },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  const handleRemove = (_member: Member) => {
    revoke({
      variables: {
        input: {
          userID: _member.id,
          type: toAuthenticationCredentials(credential),
          resourceID: resourceId,
        },
      },
      refetchQueries: [
        {
          query: UsersWithCredentialsDocument,
          variables: { input: { type: toAuthenticationCredentials(credential), resourceID: resourceId } },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  const availableMembers = useMemo(() => {
    return parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, data]);

  if (loadingMembers) {
    return <Loading />;
  }

  return (
    <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
  );
};
export default EditCredentials;
