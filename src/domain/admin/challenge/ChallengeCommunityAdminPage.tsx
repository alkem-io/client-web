import React, { FC } from 'react';
import ChallengeSettingsLayout from './ChallengeSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import LeadingOrganizationView from './views/LeadingOrganizationView';
import CommunityAdminView from '../community/views/CommunityAdminView';
import { useChallenge, useHub } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { SectionSpacer } from '../../../components/core/Section/Section';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import useChallengeApplications from './providers/useChallengeApplications';
import { Loading } from '../../../components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import ChallengeCommunityAdminMembershipPreferencesSection from './ChallengeCommunityAdminMembershipPreferencesSection';

const ChallengeCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { hubId, communityId: hubCommunityId } = useHub();
  const { challenge, challengeId } = useChallenge();
  const communityId = challenge?.community?.id;

  const { applications, loading: isLoadingApplications } = useChallengeApplications();

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <LeadingOrganizationView />
      <SectionSpacer />
      <CommunityAdminView
        credential={AuthorizationCredential.ChallengeMember}
        resourceId={challengeId}
        communityId={communityId}
        parentCommunityId={hubCommunityId}
      />
      <SectionSpacer />
      {isLoadingApplications ? <Loading /> : <ApplicationsAdminView applications={applications} />}
      <SectionSpacer />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
      <SectionSpacer />
      <ChallengeCommunityAdminMembershipPreferencesSection hubId={hubId} challengeId={challengeId} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunityAdminPage;
