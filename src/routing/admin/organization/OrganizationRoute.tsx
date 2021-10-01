import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { useOrganization } from '../../../hooks';
import { EditMode } from '../../../models/editMode';
import { FourOuFour, PageProps } from '../../../pages';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildOrganizationUrl } from '../../../utils/urlBuilders';
import OrganizationAuthorizationRoute from './OrganizationAuthorizationRoute';
import { OrganizationCommunityRoute } from './OrganizationCommunityRoute';

export const OrganizationRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { displayName, organizationNameId, loading } = useOrganization();

  const currentPaths = useMemo(() => [...paths, { value: url, name: displayName, real: true }], [paths, displayName]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplatePage
          data={managementData.organizationLvl}
          paths={currentPaths}
          title={displayName}
          entityUrl={buildOrganizationUrl(organizationNameId)}
          loading={loading}
        />
      </Route>
      <Route exact path={`${path}/edit`}>
        <OrganizationPage mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route path={`${path}/community`}>
        <OrganizationCommunityRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <OrganizationAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
