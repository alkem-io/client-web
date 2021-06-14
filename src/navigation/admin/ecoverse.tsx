import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import EcoverseList from '../../pages/Admin/Ecoverse/EcoverseList';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import Loading from '../../components/core/Loading';
import { EcoverseProvider } from '../../context/EcoverseProvider';
import { useEcoverseCommunityQuery, useUsersQuery } from '../../generated/graphql';
import { useEcoverse } from '../../hooks/useEcoverse';
import { useTransactionScope } from '../../hooks/useSentry';
import { FourOuFour, PageProps } from '../../pages';
import { ChallengesRoute } from './challenge';
import { CommunityRoute } from './community';
import EditEcoverse from '../../pages/Admin/Ecoverse/EditEcoverse';
import NewEcoverse from '../../pages/Admin/Ecoverse/NewEcoverse';

export interface AdminParameters {
  challengeId: string;
  opportunityId: string;
  organizationId: string;
  groupId: string;
}

export const EcoverseListAdminRoute: FC<PageProps> = ({ paths }) => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'ecoverses', real: true }], []);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <EcoverseList paths={currentPaths} />
      </Route>
      <Route path={`${path}/new`}>
        <NewEcoverse paths={currentPaths} />
      </Route>
      <Route path={`${path}/:ecoverseId`}>
        <EcoverseProvider>
          <EcoverseAdminRoute paths={currentPaths} />
        </EcoverseProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface EcoverseAdminRouteProps extends PageProps {}

export const EcoverseAdminRoute: FC<EcoverseAdminRouteProps> = ({ paths }) => {
  useTransactionScope({ type: 'admin' });
  const { ecoverseId, ecoverse } = useEcoverse();
  const { path, url } = useRouteMatch();
  const { data, loading: loadingEcoverse } = useEcoverseCommunityQuery({ variables: { ecoverseId } });
  const { data: usersInfo, loading: loadingUsers } = useUsersQuery();
  const currentPaths = useMemo(
    () => [...paths, { value: url, name: ecoverse?.ecoverse.displayName || '', real: true }],
    [paths, ecoverse]
  );

  const community = data?.ecoverse.community;
  const parentMembers = usersInfo?.users || [];

  if (loadingEcoverse || loadingUsers) return <Loading text={'Loading'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.ecoverseLvl} paths={currentPaths} />
      </Route>
      <Route path={`${path}/edit`}>
        <EditEcoverse paths={currentPaths} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute paths={currentPaths} community={community} parentMembers={parentMembers} />
      </Route>
      <Route path={`${path}/challenges`}>
        <ChallengesRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
