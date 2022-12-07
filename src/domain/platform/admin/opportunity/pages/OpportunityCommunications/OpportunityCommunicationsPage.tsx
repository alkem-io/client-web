import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Community/CommunityTypes';
import { useAppendBreadcrumb } from '../../../../../../core/routing/usePathUtils';
import CommunityUpdatesPage from '../../../community/CommunityUpdatesPage';
import { SettingsSection } from '../../../layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../layout/EntitySettings/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';

interface OpportunityCommunicationsPageProps extends SettingsPageProps, WithCommunity {}

const OpportunityCommunicationsPage: FC<OpportunityCommunicationsPageProps> = ({
  paths,
  communityId,
  parentCommunityId,
  routePrefix = '../',
}) => {
  useAppendBreadcrumb(paths, { name: 'communications' });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} parentCommunityId={parentCommunityId} />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityCommunicationsPage;
