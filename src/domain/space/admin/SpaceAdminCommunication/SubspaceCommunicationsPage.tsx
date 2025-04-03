import React, { FC } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SpaceAdminLayoutSubspace';
import SpaceAdminCommunityUpdatesPage, { SpaceAdminCommunityUpdatesPageProps } from './SpaceAdminCommunityUpdatesPage';

interface SubspaceCommunicationsPageProps extends SettingsPageProps, SpaceAdminCommunityUpdatesPageProps {}

const SubspaceCommunicationsPage: FC<SubspaceCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <SpaceAdminCommunityUpdatesPage communityId={communityId} />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceCommunicationsPage;
