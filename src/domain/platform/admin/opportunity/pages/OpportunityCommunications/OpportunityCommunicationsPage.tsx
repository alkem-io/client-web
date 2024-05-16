import React, { FC } from 'react';
import CommunityUpdatesPage, { CommunityUpdatesPageProps } from '../../../community/CommunityUpdatesPage';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '../../../subspace/SubspaceSettingsLayout';

interface OpportunityCommunicationsPageProps extends SettingsPageProps, CommunityUpdatesPageProps {}

const OpportunityCommunicationsPage: FC<OpportunityCommunicationsPageProps> = ({
  communityId,
  routePrefix = '../',
}) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </SubspaceSettingsLayout>
  );
};

export default OpportunityCommunicationsPage;
