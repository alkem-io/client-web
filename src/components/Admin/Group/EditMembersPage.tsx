import React, { FC, useMemo } from 'react';
import { Container } from '@material-ui/core';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';

import { WithCommunity, WithOptionalMembersProps } from '../Community/CommunityTypes';

interface EditMembersPageProps extends WithOptionalMembersProps, WithCommunity {
  groupId: string;
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ paths, parentMembers, groupId }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container maxWidth="xl">
      <EditGroupCredentials
        credential={AuthorizationCredential.UserGroupMember}
        resourceId={groupId || ''}
        parentMembers={parentMembers}
      />
    </Container>
  );
};

export default EditMembersPage;
