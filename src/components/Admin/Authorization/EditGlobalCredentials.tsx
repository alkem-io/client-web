import React, { FC, useMemo } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useGrantCredentialsMutation,
  useRevokeCredentialsMutation,
  useUsersWithCredentialsQuery,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential } from '../../../types/graphql-schema';
import Loading from '../../core/Loading';
import { EditMembers } from '../Community/EditMembers';

interface EditGlobalCredentialsProps {
  credential: AuthorizationCredential;
  resourceId?: string;
  parentMembers: Member[];
}

export const EditGlobalCredentials: FC<EditGlobalCredentialsProps> = ({ credential, parentMembers, resourceId }) => {
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
          type: credential,
          resourceID: resourceId,
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
          type: credential,
          resourceID: resourceId,
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
    return parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, data]);

  if (loadingMembers) {
    return <Loading />;
  }

  return (
    <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
  );
};

export default EditGlobalCredentials;
