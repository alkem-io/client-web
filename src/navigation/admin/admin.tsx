import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
/*lib imports end*/

import { GroupPage, ListPage } from '../../components/Admin';
import Loading from '../../components/core/Loading';
import { useTransactionScope } from '../../hooks/useSentry';
import { useEcoverseGroupsListQuery } from '../../generated/graphql';
import { FourOuFour, PageProps } from '../../pages';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import { UsersRoute } from './user';
import { ChallengesRoute } from './challenge';
import { OrganizationsRoute } from './organization';
import managementData from '../../components/Admin/managementData';
/*local files imports end*/

export interface AdminParameters {
  challengeId: string;
  opportunityId: string;
  organizationId: string;
  groupId: string;
}

export const Admin: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <Container>
      <Switch>
        <Route exact path={`${path}`}>
          <ManagementPageTemplate data={managementData.adminLvl} paths={currentPaths} />
        </Route>
        <Route path={`${path}/users`}>
          <UsersRoute paths={currentPaths} />
        </Route>
        <Route path={`${path}/groups`}>
          <GroupsRoute paths={currentPaths} />
        </Route>
        <Route path={`${path}/challenges`}>
          <ChallengesRoute paths={currentPaths} />
        </Route>
        <Route path={`${path}/organizations`}>
          <OrganizationsRoute paths={currentPaths} />
        </Route>
        <Route path="*">
          <FourOuFour />
        </Route>
      </Switch>
    </Container>
  );
};

const GroupsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useEcoverseGroupsListQuery();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);
  const groupsList = data?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` }));

  if (loading) return <Loading text={'Loading Groups ...'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage data={groupsList || []} paths={currentPaths} title={'Ecoverse groups'} newLink={`${url}/new`} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateGroupPage action={'createEcoverseGroup'} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
