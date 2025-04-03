import React, { FC } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';
import CommunityUpdatesPage, { CommunityUpdatesPageProps } from './CommunityUpdatesPage';

interface SubspaceCommunicationsPageProps extends SettingsPageProps, CommunityUpdatesPageProps {}

const SubspaceCommunicationsPage: FC<SubspaceCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceCommunicationsPage;
