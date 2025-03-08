import React, { FC } from 'react';
import SpaceAboutEdit from './SpaceAboutEdit';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';

const SpaceSettingsAboutPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading } = useUrlResolver();

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      {loading ? <Loading /> : <SpaceAboutEdit spaceId={spaceId} />}
    </SpaceSettingsLayout>
  );
};

export default SpaceSettingsAboutPage;
