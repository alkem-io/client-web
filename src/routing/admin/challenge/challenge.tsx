import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import { useChallengeCommunityQuery, useEcoverseCommunityQuery } from '../../../hooks/generated/graphql';
import { useEcoverse, useUrlParams } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { FourOuFour, PageProps } from '../../../pages';
import ChallengeList from '../../../pages/Admin/Challenge/ChallengeList';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import EditChallenge from '../../../components/Admin/EditChallenge';
import FormMode from '../../../components/Admin/FormMode';
import { CommunityRoute } from '../community';
import { OpportunitiesRoutes } from '../opportunity/opportunity';
import { ChallengeLifecycleRoute } from './ChallengeLifecycleRoute';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import { buildChallengeUrl } from '../../../utils/urlBuilders';
import { ChallengeProvider } from '../../../context/ChallengeProvider';
import { OpportunityProvider } from '../../../context/OpportunityProvider';
import { nameOfUrl } from '../../url-params';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ChallengeList paths={currentPaths} />
      </Route>
      <Route path={`${path}/new`}>
        <EditChallenge mode={FormMode.create} paths={currentPaths} title={t('navigation.admin.challenge.create')} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.challengeNameId}`}>
        <ChallengeProvider>
          <ChallengeRoutes paths={currentPaths} />
        </ChallengeProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ChallengeRoutes: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();
  const { challengeNameId } = useUrlParams();
  const { ecoverseNameId } = useEcoverse();

  const { data } = useChallengeCommunityQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });
  const { data: ecoverseCommunity } = useEcoverseCommunityQuery({
    variables: { ecoverseId: ecoverseNameId },
    fetchPolicy: 'cache-and-network',
  });

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.ecoverse?.challenge?.displayName || '', real: true }],
    [paths, data?.ecoverse?.challenge?.displayName]
  );

  const community = data?.ecoverse?.challenge?.community;
  const parentMembers = ecoverseCommunity?.ecoverse?.community?.members || [];
  const challengeUUID = data?.ecoverse.challenge.id || '';

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate
          data={managementData.challengeLvl}
          paths={currentPaths}
          title={data?.ecoverse.challenge.displayName}
          entityUrl={buildChallengeUrl(ecoverseNameId, challengeNameId)}
        />
      </Route>
      <Route path={`${path}/edit`}>
        <EditChallenge mode={FormMode.update} paths={currentPaths} title={t('navigation.admin.challenge.edit')} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute
          paths={currentPaths}
          community={community}
          parentMembers={parentMembers}
          credential={AuthorizationCredential.ChallengeMember}
          resourceId={challengeUUID}
          accessedFrom="challenge"
        />
      </Route>
      <Route path={`${path}/opportunities`}>
        <OpportunityProvider>
          <OpportunitiesRoutes paths={currentPaths} />
        </OpportunityProvider>
      </Route>
      <Route path={`${path}/authorization`}>
        <ChallengeAuthorizationRoute paths={currentPaths} resourceId={challengeUUID} />
      </Route>
      <Route path={`${path}/lifecycle`}>
        <ChallengeLifecycleRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
