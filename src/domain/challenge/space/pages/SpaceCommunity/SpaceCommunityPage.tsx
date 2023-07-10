import React, { FC } from 'react';
import SpaceCommunityView from './SpaceCommunityView';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { useSpace } from '../../SpaceContext/useSpace';

const SpaceCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading } = useSpace();

  if (!spaceId || loading) {
    return null;
  }

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <SpaceCommunityView spaceId={spaceId} />
    </SpaceSettingsLayout>
  );
};

export default SpaceCommunityPage;
