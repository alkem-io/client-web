import React, { FC } from 'react';
import SubspaceSettingsLayout from '../../../../platform/admin/subspace/SubspaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage, {
  CommunityUpdatesPageProps,
} from '../../../../platform/admin/community/CommunityUpdatesPage';

interface SubspaceCommunicationsPageProps extends SettingsPageProps, CommunityUpdatesPageProps {}

const SubspaceCommunicationsPage: FC<SubspaceCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceCommunicationsPage;
