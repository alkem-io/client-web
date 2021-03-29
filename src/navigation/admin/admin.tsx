import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import Loading from '../../components/core/Loading';
import { useEcoverseCommunityQuery, useUsersQuery } from '../../generated/graphql';
import { useTransactionScope } from '../../hooks/useSentry';
import { FourOuFour } from '../../pages';
import { ChallengesRoute } from './challenge';
import { CommunityRoute } from './community';
import { OrganizationsRoute } from './organization';

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
  const { data, loading: loadingEcoverse } = useEcoverseCommunityQuery();
  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();

  const community = data?.ecoverse.community;
  const parentMembers = usersInfo?.users || [];
  if (loadingEcoverse || loadingUsers) return <Loading text={'Loading'} />;

  return (
    <Container>
      <Switch>
        <Route exact path={`${path}`}>
          <ManagementPageTemplate data={managementData.adminLvl} paths={currentPaths} />
        </Route>
        <Route path={`${path}/community`}>
          <CommunityRoute paths={currentPaths} community={community} parentMembers={parentMembers} />
        </Route>
        <Route path={`${path}/challenges`}>
          <ChallengesRoute paths={currentPaths} />
        </Route>
        <Route path={`${path}/organizations`}>
          <OrganizationsRoute paths={currentPaths} parentMembers={parentMembers} />
        </Route>
        <Route path="*">
          <FourOuFour />
        </Route>
      </Switch>
    </Container>
  );
};
