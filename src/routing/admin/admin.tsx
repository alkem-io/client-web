import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import Loading from '../../components/core/Loading/Loading';
import { useUsersQuery } from '../../hooks/generated/graphql';
import { useTransactionScope } from '../../hooks';
import { FourOuFour } from '../../pages';
import { EcoverseListAdminRoute } from './ecoverse/ecoverse';
import { OrganizationsRoute } from './organisation/organization';
import { UsersRoute } from './user';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';

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
  // todo parentMembers should not be fetched on this level probably setup an organisation provider
  // to fetch them when necessary in organisation admin tree
  const { data: usersInfo, loading: loadingUsers } = useUsersQuery({ fetchPolicy: 'cache-and-network' });
  const parentMembers = usersInfo?.users || [];

  if (loadingUsers) return <Loading text={'Loading'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.adminLvl} paths={currentPaths} />
      </Route>
      <Route path={`${path}/users`}>
        <UsersRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <GlobalAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/ecoverses`}>
        <EcoverseListAdminRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/organizations`}>
        <OrganizationsRoute paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
