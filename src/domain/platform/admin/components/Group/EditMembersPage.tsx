import { Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { SettingsSection } from '../../layout/EntitySettings/constants';
import OrganizationAdminLayout from '../../organization/OrganizationAdminLayout';
import { useUpdateNavigation } from '../../../../../hooks';
import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';
import { PageProps } from '../../../../shared/types/PageProps';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';
import { WithCommunity } from '../Community/CommunityTypes';

interface EditMembersPageProps extends PageProps, WithCommunity {
  groupId: string;
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ paths, parentCommunityId, groupId }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community} tabRoutePrefix="../../../../">
      <Container maxWidth="xl">
        <EditGroupCredentials
          credential={AuthorizationCredential.UserGroupMember}
          resourceId={groupId || ''}
          parentCommunityId={parentCommunityId}
        />
      </Container>
    </OrganizationAdminLayout>
  );
};

export default EditMembersPage;
