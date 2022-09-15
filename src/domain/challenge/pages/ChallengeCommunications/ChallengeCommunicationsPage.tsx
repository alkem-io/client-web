import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../domain/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
import { WithCommunity } from '../../../admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../pages/Admin/Community/CommunityUpdatesPage';

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
