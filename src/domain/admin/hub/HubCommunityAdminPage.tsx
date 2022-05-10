import React, { FC } from 'react';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { SectionSpacer } from '../../../components/core/Section/Section';
import CommunityAdminView from '../community/views/CommunityAdminView';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Loading } from '../../../components/core';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import { useHub } from '../../../hooks';
import useHubApplications from './providers/useHubApplications';
import { HubCommunityAdminMembershipPreferencesSection } from './HubCommunityAdminMembershipPreferencesSection';

const HubCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { hubId, communityId } = useHub();

  const { applications, loading: isLoadingApplications } = useHubApplications();

  return (
    <HubSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <CommunityAdminView credential={AuthorizationCredential.HubMember} resourceId={hubId} communityId={communityId} />
      <SectionSpacer />
      {isLoadingApplications ? <Loading /> : <ApplicationsAdminView applications={applications} />}
      <SectionSpacer />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
      <SectionSpacer />
      <HubCommunityAdminMembershipPreferencesSection />
    </HubSettingsLayout>
  );
};

export default HubCommunityAdminPage;
