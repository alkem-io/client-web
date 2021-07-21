import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { managementData } from '../../../components/Admin/managementData';
import ManagementPageTemplate from '../../../components/Admin/ManagementPageTemplate';
import { useChallengeCommunityQuery, useEcoverseCommunityQuery } from '../../../generated/graphql';
import { useEcoverse } from '../../../hooks/useEcoverse';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { FourOuFour, PageProps } from '../../../pages';
import ChallengeList from '../../../pages/Admin/Challenge/ChallengeList';
import { AuthorizationCredential } from '../../../types/graphql-schema';
import EditChallenge from '../../../components/Admin/EditChallenge';
import FormMode from '../../../components/Admin/FormMode';
import { AdminParameters } from '../admin';
import AuthorizationRoute from '../authorization';
import { CommunityRoute } from '../community';
import { OpportunitiesRoutes } from '../opportunity/opportunity';
import { useTranslation } from 'react-i18next';

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
      <Route path={`${path}/:challengeId`}>
        <ChallengeRoutes paths={currentPaths} />
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
  const { challengeId } = useParams<AdminParameters>();
  const { ecoverseId } = useEcoverse();

  const { data } = useChallengeCommunityQuery({ variables: { ecoverseId, challengeId } });
  const { data: ecoverseCommunity } = useEcoverseCommunityQuery({ variables: { ecoverseId } });

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
        <ManagementPageTemplate data={managementData.challengeLvl} paths={currentPaths} />
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
        <OpportunitiesRoutes paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <AuthorizationRoute paths={currentPaths} resourceId={challengeUUID} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
