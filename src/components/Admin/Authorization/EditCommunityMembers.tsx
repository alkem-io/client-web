import React, { FC } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToCommunityMutation,
  useRemoveUserFromCommunityMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useAvailableMembers } from '../../../hooks';
import { Member } from '../../../models/User';
import { AuthorizationCredential } from '../../../models/graphql-schema';
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
  | AuthorizationCredential.OrganizationMember
  | AuthorizationCredential.ChallengeMember;

export const EditCommunityMembers: FC<EditCredentialsProps> = ({
  parentMembers,
  credential,
  resourceId,
  communityId,
}) => {
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingMember }] = useAssignUserToCommunityMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingMember }] = useRemoveUserFromCommunityMutation({
    onError: handleError,
  });

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

  const { available, current, loading } = useAvailableMembers(credential, resourceId, parentMembers);

  return (
    <EditMembers
      members={current}
      availableMembers={available}
      onAdd={handleAdd}
      addingMember={addingMember}
      onRemove={handleRemove}
      removingMember={removingMember}
      loadingMembers={loading}
      loadingAvailableMembers={loading}
    />
  );
};
export default EditCommunityMembers;
