import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useUpdateNavigation } from '../../../hooks';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import { AuthorizationCredential } from '../../../types/graphql-schema';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';

import { WithCommunity } from '../Community/CommunityTypes';

interface EditMembersPageProps extends PageProps, WithCommunity {
  parentMembers: Member[];
  groupId: string;
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ paths, parentMembers = [], groupId }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container>
      <EditGroupCredentials
        credential={AuthorizationCredential.UserGroupMember}
        resourceId={groupId || ''}
        parentMembers={parentMembers}
      />
    </Container>
  );
};

export default EditMembersPage;
