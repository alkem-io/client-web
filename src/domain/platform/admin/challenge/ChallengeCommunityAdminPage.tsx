import React, { FC } from 'react';
import ChallengeSettingsLayout from './ChallengeSettingsLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import useChallengeApplications from './providers/useChallengeApplications';
import Loading from '../../../../core/ui/loading/Loading';
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
  const { spaceId } = useSpace();
  const { challenge, challengeId } = useChallenge();
  const { t } = useTranslation();

  const communityId = challenge?.community?.id;

  const { applications, loading: isLoadingApplications } = useChallengeApplications();

  const leadingOrganizationsProps = useChallengeLeadOrganizationAssignment({
    spaceId,
    challengeId,
  });

  const memberOrganizationsProps = useChallengeMemberOrganizationAssignment({
    spaceId,
    challengeId,
  });

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: {
      spaceId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.space.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableMemberUsersLazyQuery,
      readUsers: data => data.space.challenge.community?.availableMemberUsers,
      refetchQuery: refetchChallengeAvailableMemberUsersQuery,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      spaceId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.space.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableLeadUsersLazyQuery,
      readUsers: data => data.space.challenge.community?.availableLeadUsers,
      refetchQuery: refetchChallengeAvailableLeadUsersQuery,
    },
  });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <Gutters>
        <EditCommunityMembersSection memberType="leads">
          <EditMemberUsersWithPopup {...leadUsersProps} />
          <EditOrganizationsWithPopup {...leadingOrganizationsProps} />
        </EditCommunityMembersSection>

        <EditCommunityMembersSection memberType="members">
          <EditMemberUsersWithPopup {...memberUsersProps} />
          <EditOrganizationsWithPopup {...memberOrganizationsProps} />
        </EditCommunityMembersSection>
        {isLoadingApplications ? <Loading /> : <ApplicationsAdminView applications={applications} />}
        {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
        <ChallengeCommunityAdminMembershipPreferencesSection spaceId={spaceId} challengeId={challengeId} />

        <DashboardGenericSection
          headerText={t('community.application-form.title')}
          subHeaderText={
            <Text>
              <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
            </Text>
          }
        >
          <CommunityApplicationForm spaceId={spaceId} challengeId={challengeId} />
        </DashboardGenericSection>
      </Gutters>
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunityAdminPage;
