import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import Loading from '../../components/core/Loading';
import { useUsersQuery } from '../../generated/graphql';
import { useTransactionScope } from '../../hooks/useSentry';
import { FourOuFour } from '../../pages';
import AuthorizationRoute from './authorization';
import { EcoverseListAdminRoute } from './ecoverse';
import { OrganizationsRoute } from './organization';
import { UsersRoute } from './user';

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
  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();
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
        <AuthorizationRoute paths={currentPaths} />
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
