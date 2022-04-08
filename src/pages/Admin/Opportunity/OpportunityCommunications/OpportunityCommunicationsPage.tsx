import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../components/composite/layout/OpportunitySettingsLayout/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage from '../../Community/CommunityUpdatesPage';
import { WithCommunity } from '../../../../components/Admin/Community/CommunityTypes';

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
