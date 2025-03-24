import React, { FC } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage, {
  CommunityUpdatesPageProps,
} from '@/domain/platform/admin/community/CommunityUpdatesPage';
import SubspaceSettingsLayout from '@/domain/space/routing/toReviewAdmin/SubspaceSettingsLayout';

interface SubspaceCommunicationsPageProps extends SettingsPageProps, CommunityUpdatesPageProps {}

const SubspaceCommunicationsPage: FC<SubspaceCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceCommunicationsPage;
