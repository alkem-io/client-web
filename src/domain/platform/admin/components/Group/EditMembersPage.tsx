import { Container } from '@mui/material';
import React, { FC } from 'react';
import { SettingsSection } from '../../layout/EntitySettingsLayout/constants';
import OrganizationAdminLayout from '../../organization/OrganizationAdminLayout';
import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';
import { WithCommunity } from '../Community/CommunityTypes';

interface EditMembersPageProps extends WithCommunity {
  groupId: string;
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ parentCommunityId, groupId }) => {
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
