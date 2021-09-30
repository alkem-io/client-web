import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import EditChallenge from '../../../components/Admin/EditChallenge';
import FormMode from '../../../components/Admin/FormMode';
import { managementData } from '../../../components/Admin/managementData';
import { ChallengeProvider } from '../../../context/ChallengeProvider';
import { useChallenge, useUpdateNavigation } from '../../../hooks';
import { useChallengeCommunityQuery, useEcoverseCommunityQuery } from '../../../hooks/generated/graphql';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { FourOuFour, PageProps } from '../../../pages';
import ChallengeList from '../../../pages/Admin/Challenge/ChallengeList';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildChallengeUrl } from '../../../utils/urlBuilders';
import { nameOfUrl } from '../../url-params';
import { CommunityRoute } from '../community';
import { OpportunitiesRoutes } from '../opportunity/opportunity';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import { ChallengeLifecycleRoute } from './ChallengeLifecycleRoute';

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
  const { ecoverseNameId, challengeId, challengeNameId } = useChallenge();

  const { data } = useChallengeCommunityQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const { data: ecoverseCommunity } = useEcoverseCommunityQuery({
    variables: { ecoverseId: ecoverseNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: data?.ecoverse?.challenge?.displayName || '', real: true }],
    [paths, data?.ecoverse?.challenge?.displayName]
  );

  const community = data?.ecoverse?.challenge?.community;
  const parentMembers = ecoverseCommunity?.ecoverse?.community?.members || [];

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplatePage
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
          resourceId={challengeId}
          accessedFrom="challenge"
        />
      </Route>
      <Route path={`${path}/opportunities`}>
        <OpportunitiesRoutes paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <ChallengeAuthorizationRoute paths={currentPaths} resourceId={challengeId} />
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
