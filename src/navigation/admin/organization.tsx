import React, { FC, useMemo } from 'react';
import { FourOuFour, PageProps } from '../../pages';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import { GroupPage } from '../../components/Admin/Group/GroupPage';
import {
  useOrganisationProfileInfoQuery,
  useOrganizationGroupsQuery,
  useOrganizationsListQuery,
} from '../../generated/graphql';
import { ListPage } from '../../components/Admin/ListPage';
import { AdminParameters } from './admin';
import { EditMode } from '../../utils/editMode';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import managementData from '../../components/Admin/managementData';
import OrganizationPage from '../../components/Admin/Organization/OrganizationPage';

export const OrganizationsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data: organizationsListQuery } = useOrganizationsListQuery();

  const organizationsList = organizationsListQuery?.organisations?.map(c => ({
    id: c.id,
    value: c.name,
    url: `${url}/${c.id}`,
  }));

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [
    paths,
    organizationsListQuery?.organisations,
  ]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage
          paths={currentPaths}
          data={organizationsList || []}
          newLink={`${url}/new`}
          title={'Organizations list'}
        />
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

  const { data } = useOrganisationProfileInfoQuery({ variables: { id: Number(organizationId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: data?.organisation?.name || '', real: true }], [
    paths,
    data?.organisation?.name,
  ]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.organizationLvl} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/edit`}>
        <OrganizationPage organization={data?.organisation} mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route path={`${path}/groups`}>
        <OrganizationGroupRoutes paths={currentPaths} />
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
        <CreateGroupPage action={'createOrganizationGroup'} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
    </Switch>
  );
};

const OrganizationGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { organizationId } = useParams<AdminParameters>();
  const { data } = useOrganizationGroupsQuery({ variables: { id: Number(organizationId) } });

  const groups = data?.organisation?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} />;
};
