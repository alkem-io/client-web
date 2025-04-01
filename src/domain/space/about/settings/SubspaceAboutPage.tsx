import React, { FC } from 'react';

import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpaceAboutEdit from '@/domain/space/admin/SpaceAboutSettings/SpaceAboutEdit';
import Loading from '@/core/ui/loading/Loading';
import SubspaceSettingsLayout from '@/domain/space/routing/toReviewAdmin/SubspaceSettingsLayout';

const SubspaceAboutPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading } = useUrlResolver();

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      {loading ? <Loading /> : <SpaceAboutEdit spaceId={spaceId} />}
    </SubspaceSettingsLayout>
  );
};

export default SubspaceAboutPage;
