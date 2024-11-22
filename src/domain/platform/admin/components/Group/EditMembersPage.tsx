import { Container } from '@mui/material';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import OrganizationAdminLayout from '@/domain/platform/admin/organization/OrganizationAdminLayout';
import { AuthorizationCredential } from '@/core/apollo/generated/graphql-schema';
import EditGroupCredentials from '../Authorization/EditGroupCredentials';

type EditMembersPageProps = {
  groupId: string;
  parentCommunityId: string | undefined;
};

export const EditMembersPage = ({ parentCommunityId, groupId }: EditMembersPageProps) => (
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

export default EditMembersPage;
