import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { ListPage } from '../../../components/Admin';
import { WithParentMembersProps } from '../../../components/Admin/Community/CommunityTypes';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import { CreateOrganizationGroupPage } from '../../../components/Admin/Organization/CreateOrganizationGroup';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { useUpdateNavigation } from '../../../hooks';
import { useOrganizationGroupsQuery, useOrganizationProfileInfoQuery } from '../../../hooks/generated/graphql';
import { Organisation } from '../../../models/graphql-schema';
import { FourOuFour, PageProps } from '../../../pages';
import OrganisationCommunityPage from '../../../pages/Admin/Organisation/OrganisationCommunityPage';
import { EditMode } from '../../../utils/editMode';
import { AdminParameters } from '../admin';
import OrganisationAuthorizationRoute from './OrganisationAuthorizationRoute';
import { OrganisationGroupRoute } from './OrganisationGroupRoute';
import { buildOrganisationUrl } from '../../../utils/urlBuilders';

export interface OrganizationRouteParams {
  organizationId: string;
}

export const OrganizationsRoute: FC<WithParentMembersProps> = ({ paths, parentMembers }) => {
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

  const { data } = useOrganizationProfileInfoQuery({
    variables: { id: organizationId },
    fetchPolicy: 'cache-and-network',
  });

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.organisation?.displayName || '', real: true }],
    [paths, data?.organisation?.displayName]
  );

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate
          data={managementData.organizationLvl}
          paths={currentPaths}
          title={data?.organisation?.displayName}
          entityUrl={buildOrganisationUrl(data?.organisation?.nameID || '')}
        />
      </Route>
      <Route exact path={`${path}/edit`}>
        <OrganizationPage organization={data?.organisation as Organisation} mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route path={`${path}/community`}>
        <OrganizationCommunityRoute paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path={`${path}/authorization`}>
        <OrganisationAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

export const OrganizationCommunityRoute: FC<WithParentMembersProps> = ({ paths, parentMembers }) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/groups`}>
        <OrganizationGroupRoutes paths={paths} />
      </Route>
      <Route path={`${path}/members`}>
        <OrganizationMemberRoutes paths={paths} parentMembers={parentMembers} />
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
        <OrganisationGroupRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const OrganizationMemberRoutes: FC<WithParentMembersProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: true }], [paths, url]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OrganisationCommunityPage paths={currentPaths} parentMembers={parentMembers} />
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

  const groups = data?.organisation?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} />;
};
