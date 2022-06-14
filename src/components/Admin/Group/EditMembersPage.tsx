import { Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { PageProps } from '../../../pages';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';
import { WithCommunity } from '../Community/CommunityTypes';

interface EditMembersPageProps extends PageProps, WithCommunity {
  groupId: string;
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ paths, parentCommunityId, groupId }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container maxWidth="xl">
      <EditGroupCredentials
        credential={AuthorizationCredential.UserGroupMember}
        resourceId={groupId || ''}
        parentCommunityId={parentCommunityId}
      />
    </Container>
  );
};

export default EditMembersPage;
