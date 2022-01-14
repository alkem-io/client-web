import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { useOrganization } from '../../../hooks';
import { EditMode } from '../../../models/editMode';
import { Error404, PageProps } from '../../../pages';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildOrganizationUrl } from '../../../utils/urlBuilders';
import OrganizationAuthorizationRoute from './OrganizationAuthorizationRoute';
import { OrganizationCommunityRoute } from './OrganizationCommunityRoute';

export const OrganizationRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('./');

  const { displayName, organizationNameId, loading } = useOrganization();

  const currentPaths = useMemo(() => [...paths, { value: url, name: displayName, real: true }], [paths, displayName]);

  return (
    <Routes>
      <Route>
        <ManagementPageTemplatePage
          data={managementData.organizationLvl}
          paths={currentPaths}
          title={displayName}
          entityUrl={buildOrganizationUrl(organizationNameId)}
          loading={loading}
        />
      </Route>
      <Route path={'edit'}>
        <OrganizationPage mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route path={'community'}>
        <OrganizationCommunityRoute paths={currentPaths} />
      </Route>
      <Route path={'authorization'}>
        <OrganizationAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
