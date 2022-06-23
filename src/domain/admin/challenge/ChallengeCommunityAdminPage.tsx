import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ChallengeSettingsLayout from './ChallengeSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import AdminCommunityOrganizationsView from './views/AdminCommunityOrganizationsView';
import CommunityAdminView from '../community/views/CommunityAdminView';
import { useChallenge, useHub } from '../../../hooks';
import { SectionSpacer } from '../../shared/components/Section/Section';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import useChallengeApplications from './providers/useChallengeApplications';
import { Loading } from '../../../components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import ChallengeCommunityAdminMembershipPreferencesSection from './ChallengeCommunityAdminMembershipPreferencesSection';
import useChallengeLeadOrganizationAssignment from '../../community/useCommunityAssignment/useChallengeLeadOrganizationAssignment';
import useChallengeMemberOrganizationAssignment from '../../community/useCommunityAssignment/useChallengeMemberOrganizationAssignment';
import useMemberUserAssignment from '../../community/useCommunityAssignment/useMemberUserAssignment';
import {
  refetchChallengeCommunityMembersQuery,
  useChallengeCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useLeadUserAssignment from '../../community/useCommunityAssignment/useLeadUserAssignment';

const ChallengeCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { t } = useTranslation();

  const { hubId, communityId: hubCommunityId } = useHub();
  const { challenge, challengeId } = useChallenge();
  const communityId = challenge?.community?.id;

  const { applications, loading: isLoadingApplications } = useChallengeApplications();

  const leadingOrganizationsProps = useChallengeLeadOrganizationAssignment({
    hubId,
    challengeId,
  });

  const memberOrganizationsProps = useChallengeMemberOrganizationAssignment({
    hubId,
    challengeId,
  });

  const memberUsersProps = useMemberUserAssignment({
    parentCommunityId: hubCommunityId,
    variables: {
      hubId,
      challengeId,
    },
    useExistingMembersQuery: options => {
      const { data } = useChallengeCommunityMembersQuery(options);

      return {
        communityId: data?.hub.challenge.community?.id,
        existingMembers: data?.hub.challenge.community?.memberUsers,
      };
    },
    refetchMembersQuery: refetchChallengeCommunityMembersQuery,
  });

  const leadUsersProps = useLeadUserAssignment({
    parentCommunityId: hubCommunityId,
    variables: {
      hubId,
      challengeId,
    },
    useExistingMembersQuery: options => {
      const { data } = useChallengeCommunityMembersQuery(options);

      return {
        communityId: data?.hub.challenge.community?.id,
        existingMembers: data?.hub.challenge.community?.leadUsers,
      };
    },
    refetchMembersQuery: refetchChallengeCommunityMembersQuery,
  });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <CommunityAdminView headerText={t('community.leading-users')} {...leadUsersProps} />
      <SectionSpacer />
      <CommunityAdminView headerText={t('community.member-users')} {...memberUsersProps} />
      <SectionSpacer />
      <AdminCommunityOrganizationsView
        headerText={t('community.leading-organizations')}
        {...leadingOrganizationsProps}
      />
      <SectionSpacer />
      <AdminCommunityOrganizationsView headerText={t('community.member-organizations')} {...memberOrganizationsProps} />
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
