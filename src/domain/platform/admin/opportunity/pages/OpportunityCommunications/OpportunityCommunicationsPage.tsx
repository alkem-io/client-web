import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../community/CommunityUpdatesPage';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '../../../subspace/SubspaceSettingsLayout';

interface OpportunityCommunicationsPageProps extends SettingsPageProps, WithCommunity {}

const OpportunityCommunicationsPage: FC<OpportunityCommunicationsPageProps> = ({
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

export default OpportunityCommunicationsPage;
