import React, { FC } from 'react';
import SubspaceSettingsLayout from '../../../../platform/admin/subspace/SubspaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { WithCommunity } from '../../../../platform/admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

interface SubspaceCommunicationsPageProps extends SettingsPageProps, WithCommunity {}

const SubspaceCommunicationsPage: FC<SubspaceCommunicationsPageProps> = ({
  communityId,
  parentCommunityId,
  routePrefix = '../',
}) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} parentCommunityId={parentCommunityId} />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceCommunicationsPage;
