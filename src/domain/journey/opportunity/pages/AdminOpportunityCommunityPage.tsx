import { FC } from 'react';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useRoleSetAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useOpportunity } from '../hooks/useOpportunity';
import SubspaceSettingsLayout from '../../../platform/admin/subspace/SubspaceSettingsLayout';
import CommunityVirtualContributors from '../../../community/community/CommunityAdmin/CommunityVirtualContributors';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { SpaceLevel } from '../../../../core/apollo/generated/graphql-schema';

const AdminOpportunityCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { loading: isLoadingChallenge, roleSetId, opportunityId } = useOpportunity();

  const { spaceId } = useSpace();

  const {
    users,
    organizations,
    virtualContributors,
    memberRoleDefinition,
    leadRoleDefinition,
    permissions,
    entitlements,
    onUserLeadChange,
    onUserAuthorizationChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    onAddVirtualContributor,
    inviteExistingUser,
    onRemoveUser,
    onRemoveOrganization,
    onRemoveVirtualContributor,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    loading,
  } = useRoleSetAdmin({ spaceId, opportunityId, roleSetId, spaceLevel: SpaceLevel.Opportunity });

  if (!spaceId || isLoadingChallenge) {
    return null;
  }

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityUsers
              users={users}
              onUserLeadChange={onUserLeadChange}
              onUserAuthorizationChange={onUserAuthorizationChange}
              canAddMembers={permissions.canAddMembers}
              onAddMember={onAddUser}
              onRemoveMember={onRemoveUser}
              fetchAvailableUsers={getAvailableUsers}
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityOrganizations
              organizations={organizations}
              onOrganizationLeadChange={onOrganizationLeadChange}
              canAddMembers={permissions.canAddMembers}
              onAddMember={onAddOrganization}
              onRemoveMember={onRemoveOrganization}
              fetchAvailableOrganizations={getAvailableOrganizations}
              memberRoleDefinition={memberRoleDefinition}
              leadRoleDefinition={leadRoleDefinition}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        {entitlements.virtualContributorsEnabled && (
          <PageContentColumn columns={6}>
            <PageContentBlock>
              <CommunityVirtualContributors
                virtualContributors={virtualContributors}
                canAddVirtualContributors={
                  permissions.canAddVirtualContributorsFromAccount || permissions.canAddMembers
                }
                inviteExistingUser={inviteExistingUser}
                onRemoveMember={onRemoveVirtualContributor}
                fetchAvailableVirtualContributors={getAvailableVirtualContributorsInLibrary}
                fetchAvailableVirtualContributorsOnAccount={getAvailableVirtualContributors}
                onAddMember={onAddVirtualContributor}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>
        )}
      </PageContent>
    </SubspaceSettingsLayout>
  );
};

export default AdminOpportunityCommunityPage;
