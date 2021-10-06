import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { PageProps } from '../../../pages';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';
import { WithCommunity, WithOptionalMembersProps } from '../Community/CommunityTypes';

interface EditMembersPageProps extends WithOptionalMembersProps, PageProps, WithCommunity {
  groupId: string;
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ paths, parentCommunityId, groupId, parentMembers }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container maxWidth="xl">
      <EditGroupCredentials
        credential={AuthorizationCredential.UserGroupMember}
        resourceId={groupId || ''}
        parentCommunityId={parentCommunityId}
        parentMembers={parentMembers}
      />
    </Container>
  );
};

export default EditMembersPage;
