import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { CreateOrganizationGroupPage } from '../../../components/Admin/Organization/CreateOrganizationGroup';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { OrganizationProvider } from '../../../context/OrganizationProvider';
import { useOrganization, useUpdateNavigation } from '../../../hooks';
import { EditMode } from '../../../models/editMode';
import { FourOuFour, PageProps } from '../../../pages';
import OrganizationCommunityPage from '../../../pages/Admin/Organization/OrganizationCommunityPage';
import { OrganizationGroupsPage } from '../../../pages/Admin/Organization/OrganizationGroupsPage';
import { buildOrganizationUrl } from '../../../utils/urlBuilders';
import { nameOfUrl } from '../../url-params';
import OrganizationAuthorizationRoute from './OrganizationAuthorizationRoute';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';

export const OrganizationsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OrganizationList paths={currentPaths} />
      </Route>
      <Route path={`${path}/new`}>
        <OrganizationPage title={'Create organization'} mode={EditMode.new} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.organizationNameId}`}>
        <OrganizationProvider>
          <OrganizationRoute paths={currentPaths} />
        </OrganizationProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

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

export const OrganizationCommunityRoute: FC<PageProps> = ({ paths }) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/groups`}>
        <OrganizationGroupRoutes paths={paths} />
      </Route>
      <Route path={`${path}/members`}>
        <OrganizationMemberRoutes paths={paths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const OrganizationGroupRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OrganizationGroupsPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateOrganizationGroupPage paths={currentPaths} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.groupId}`}>
        <OrganizationGroupRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const OrganizationMemberRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: true }], [paths, url]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OrganizationCommunityPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
