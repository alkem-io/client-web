import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
/*lib imports end*/

import { useTransactionScope } from '../../hooks/useSentry';
import { FourOuFour } from '../../pages';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import { UsersRoute } from './user';
import { ChallengesRoute } from './challenge';
import { OrganizationsRoute } from './organization';
import { managementData } from '../../components/Admin/managementData';
import { GroupsRoute } from './groups';
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
