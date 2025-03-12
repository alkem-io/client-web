import React, { FC } from 'react';

import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpaceAboutEdit from '@/domain/journey/space/pages/SpaceAboutSettings/SpaceAboutEdit';
import Loading from '@/core/ui/loading/Loading';

const SubspaceAboutPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading } = useUrlResolver();

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      {loading ? <Loading /> : <SpaceAboutEdit spaceId={spaceId} />}
    </SubspaceSettingsLayout>
  );
};

export default SubspaceAboutPage;
