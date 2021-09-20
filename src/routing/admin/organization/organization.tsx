import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { ListPage } from '../../../components/Admin';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import { CreateOrganizationGroupPage } from '../../../components/Admin/Organization/CreateOrganizationGroup';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { useUpdateNavigation } from '../../../hooks';
import { useOrganizationGroupsQuery, useOrganizationProfileInfoQuery } from '../../../hooks/generated/graphql';
import { Organization } from '../../../models/graphql-schema';
import { FourOuFour, PageProps } from '../../../pages';
import OrganizationCommunityPage from '../../../pages/Admin/Organization/OrganizationCommunityPage';
import { EditMode } from '../../../utils/editMode';
import { AdminParameters } from '../admin';
import OrganizationAuthorizationRoute from './OrganizationAuthorizationRoute';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';
import { buildOrganizationUrl } from '../../../utils/urlBuilders';

export interface OrganizationRouteParams {
  organizationId: string;
}

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
      <Route path={`${path}/:organizationId`}>
        <OrganizationRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

export const OrganizationRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { organizationId } = useParams<AdminParameters>();

  const { data } = useOrganizationProfileInfoQuery({
    variables: { id: organizationId },
    fetchPolicy: 'cache-and-network',
  });

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.organization?.displayName || '', real: true }],
    [paths, data?.organization?.displayName]
  );

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate
          data={managementData.organizationLvl}
          paths={currentPaths}
          title={data?.organization?.displayName}
          entityUrl={buildOrganizationUrl(data?.organization?.nameID || '')}
        />
      </Route>
      <Route exact path={`${path}/edit`}>
        <OrganizationPage organization={data?.organization as Organization} mode={EditMode.edit} paths={currentPaths} />
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
        <OrganizationGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateOrganizationGroupPage paths={currentPaths} />
      </Route>
      <Route path={`${path}/:groupId`}>
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

const OrganizationGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { organizationId } = useParams<AdminParameters>();
  const { data } = useOrganizationGroupsQuery({ variables: { id: organizationId } });

  const groups = data?.organization?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} />;
};
