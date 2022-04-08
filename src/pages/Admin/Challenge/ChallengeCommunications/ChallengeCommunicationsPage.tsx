import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../components/composite/layout/ChallengeSettingsLayout/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage from '../../Community/CommunityUpdatesPage';
import { WithCommunity } from '../../../../components/Admin/Community/CommunityTypes';

interface ChallengeCommunicationsPageProps extends SettingsPageProps, WithCommunity {}

const ChallengeCommunicationsPage: FC<ChallengeCommunicationsPageProps> = ({
  paths,
  communityId,
  parentCommunityId,
  routePrefix = '../',
}) => {
  useAppendBreadcrumb(paths, { name: 'communications' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} parentCommunityId={parentCommunityId} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunicationsPage;
