import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import { GroupPage } from '../../components/Admin/Group/GroupPage';
import { ListPage } from '../../components/Admin/ListPage';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import OrganizationPage from '../../components/Admin/Organization/OrganizationPage';
import {
  Organisation,
  useOrganisationProfileInfoQuery,
  useOrganizationGroupsQuery,
  useOrganizationsListQuery,
} from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { FourOuFour, PageProps } from '../../pages';
import { EditMode } from '../../utils/editMode';
import { AdminParameters, WithParentMembersProps } from './admin';

export const OrganizationsRoute: FC<WithParentMembersProps> = ({ paths, parentMembers }) => {
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
        <OrganizationRoutes paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

export const OrganizationRoutes: FC<WithParentMembersProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const { organizationId } = useParams<AdminParameters>();

  const { data } = useOrganisationProfileInfoQuery({ variables: { id: organizationId } });

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
        <OrganizationPage organization={data?.organisation as Organisation} mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route path={`${path}/groups`}>
        <OrganizationGroupRoutes paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const OrganizationGroupRoutes: FC<WithParentMembersProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OrganizationGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateGroupPage action={'createGroupOnOrganisation'} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} parentMembers={parentMembers} />
      </Route>
    </Switch>
  );
};

const OrganizationGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { organizationId } = useParams<AdminParameters>();
  const { data } = useOrganizationGroupsQuery({ variables: { id: organizationId } });

  const groups = data?.organisation?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} />;
};
