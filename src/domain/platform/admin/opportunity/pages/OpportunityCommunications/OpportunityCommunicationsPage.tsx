import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../community/CommunityUpdatesPage';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';

interface OpportunityCommunicationsPageProps extends SettingsPageProps, WithCommunity {}

const OpportunityCommunicationsPage: FC<OpportunityCommunicationsPageProps> = ({
  communityId,
  parentCommunityId,
  routePrefix = '../',
}) => {
  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} parentCommunityId={parentCommunityId} />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityCommunicationsPage;
