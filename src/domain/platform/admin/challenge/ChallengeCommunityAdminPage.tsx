import React, { FC } from 'react';
import ChallengeSettingsLayout from './ChallengeSettingsLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import useChallengeApplications from './providers/useChallengeApplications';
import { Loading } from '../../../../common/components/core';
import CommunityGroupListPage from '../community/CommunityListPage';
import ChallengeCommunityAdminMembershipPreferencesSection from './ChallengeCommunityAdminMembershipPreferencesSection';
import useChallengeLeadOrganizationAssignment from '../../../community/community/useCommunityAssignment/useChallengeLeadOrganizationAssignment';
import useChallengeMemberOrganizationAssignment from '../../../community/community/useCommunityAssignment/useChallengeMemberOrganizationAssignment';
import {
  refetchChallengeAvailableLeadUsersQuery,
  refetchChallengeAvailableMemberUsersQuery,
  refetchChallengeCommunityMembersQuery,
  useChallengeAvailableLeadUsersLazyQuery,
  useChallengeAvailableMemberUsersLazyQuery,
  useChallengeCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditMemberUsersWithPopup from '../components/Community/EditMemberUsersWithPopup';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';
import Gutters from '../../../../core/ui/grid/Gutters';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Trans, useTranslation } from 'react-i18next';
import { Text } from '../../../../core/ui/typography';
import CommunityApplicationForm from '../../../community/community/CommunityApplicationForm/CommunityApplicationForm';

const ChallengeCommunityAdminPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { hubId } = useHub();
  const { challenge, challengeId } = useChallenge();
  const { t } = useTranslation();

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

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: {
      hubId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.hub.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableMemberUsersLazyQuery,
      readUsers: data => data.hub.challenge.community?.availableMemberUsers,
      refetchQuery: refetchChallengeAvailableMemberUsersQuery,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      hubId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.hub.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableLeadUsersLazyQuery,
      readUsers: data => data.hub.challenge.community?.availableLeadUsers,
      refetchQuery: refetchChallengeAvailableLeadUsersQuery,
    },
  });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <EditCommunityMembersSection memberType="leads">
        <EditMemberUsersWithPopup {...leadUsersProps} />
        <EditOrganizationsWithPopup {...leadingOrganizationsProps} />
      </EditCommunityMembersSection>
      <Gutters />
      <EditCommunityMembersSection memberType="members">
        <EditMemberUsersWithPopup {...memberUsersProps} />
        <EditOrganizationsWithPopup {...memberOrganizationsProps} />
      </EditCommunityMembersSection>
      <Gutters />
      {isLoadingApplications ? <Loading /> : <ApplicationsAdminView applications={applications} />}
      <Gutters />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
      <Gutters />
      <ChallengeCommunityAdminMembershipPreferencesSection hubId={hubId} challengeId={challengeId} />
      <Gutters />

      <DashboardGenericSection
        headerText={t('community.application-form.title')}
        subHeaderText={
          <Text>
            <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
          </Text>
        }
      >
        <CommunityApplicationForm hubId={hubId} challengeId={challengeId} />
      </DashboardGenericSection>
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunityAdminPage;
