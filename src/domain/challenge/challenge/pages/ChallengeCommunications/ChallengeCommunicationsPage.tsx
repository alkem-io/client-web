import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { WithCommunity } from '../../../../platform/admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

interface ChallengeCommunicationsPageProps extends SettingsPageProps, WithCommunity {}

const ChallengeCommunicationsPage: FC<ChallengeCommunicationsPageProps> = ({
  communityId,
  parentCommunityId,
  routePrefix = '../',
}) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} parentCommunityId={parentCommunityId} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunicationsPage;
