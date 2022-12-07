import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../core/routing/usePathUtils';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';
import { WithCommunity } from '../../../../platform/admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

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
