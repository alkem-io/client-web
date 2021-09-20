import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import Loading from '../../../components/core/Loading/Loading';
import { EcoverseProvider } from '../../../context/EcoverseProvider';
import { useEcoverseCommunityQuery } from '../../../hooks/generated/graphql';
import { useEcoverse } from '../../../hooks';
import { useTransactionScope } from '../../../hooks';
import { FourOuFour, PageProps } from '../../../pages';
import EcoverseList from '../../../pages/Admin/Ecoverse/EcoverseList';
import EditEcoverse from '../../../pages/Admin/Ecoverse/EditEcoverse';
import NewEcoverse from '../../../pages/Admin/Ecoverse/NewEcoverse';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { ChallengesRoute } from '../challenge/challenge';
import { CommunityRoute } from '../community';
import EcoverseAuthorizationRoute from './EcoverseAuthorizationRoute';
import { buildEcoverseUrl } from '../../../utils/urlBuilders';
import { nameOfUrl } from '../../ulr-params';

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
      <Route path={`${path}/:${nameOfUrl.ecoverseId}`}>
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
  const { ecoverseId, ecoverse, loading: loadingEcoverse } = useEcoverse();
  const { path, url } = useRouteMatch();
  const { data, loading: loadingEcoverseCommunity } = useEcoverseCommunityQuery({
    variables: { ecoverseId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });
  const currentPaths = useMemo(
    () => [...paths, { value: url, name: ecoverse?.ecoverse.displayName || '', real: true }],
    [paths, ecoverse]
  );

  const community = data?.ecoverse.community;
  const ecoverseUUID = ecoverse?.ecoverse.id || '';

  if (loadingEcoverse || loadingEcoverseCommunity) return <Loading text={'Loading'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate
          data={managementData.ecoverseLvl}
          paths={currentPaths}
          title={ecoverse?.ecoverse.displayName}
          entityUrl={buildEcoverseUrl(ecoverseId)}
        />
      </Route>
      <Route path={`${path}/edit`}>
        <EditEcoverse paths={currentPaths} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute
          paths={currentPaths}
          community={community}
          credential={AuthorizationCredential.EcoverseMember}
          resourceId={ecoverseUUID}
          accessedFrom="ecoverse"
        />
      </Route>
      <Route path={`${path}/challenges`}>
        <ChallengesRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <EcoverseAuthorizationRoute paths={currentPaths} resourceId={ecoverseUUID} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
