import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import FormMode from '../../../components/Admin/FormMode';
import { managementData } from '../../../components/Admin/managementData';
import { useChallenge, useEcoverse } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { FourOuFour, PageProps } from '../../../pages';
import EditChallengePage from '../../../pages/Admin/Challenge/EditChallengePage';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildChallengeUrl } from '../../../utils/urlBuilders';
import { CommunityRoute } from '../community';
import { OpportunitiesRoute } from '../opportunity/OpportunitiesRoute';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import { ChallengeLifecycleRoute } from './ChallengeLifecycleRoute';

export const ChallengeRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();
  const { ecoverse, loading: loadingEcoverse } = useEcoverse();
  const {
    challenge,
    displayName,
    ecoverseNameId,
    challengeId,
    challengeNameId,
    loading: loadingChallenge,
  } = useChallenge();
  const loading = loadingEcoverse || loadingChallenge;

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName || '', real: true }],
    [paths, displayName]
  );

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplatePage
          data={managementData.challengeLvl}
          paths={currentPaths}
          title={displayName}
          entityUrl={buildChallengeUrl(ecoverseNameId, challengeNameId)}
          loading={loading}
        />
      </Route>
      <Route path={`${path}/edit`}>
        <EditChallengePage mode={FormMode.update} paths={currentPaths} title={t('navigation.admin.challenge.edit')} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute
          paths={currentPaths}
          communityId={challenge?.community?.id}
          parentCommunityId={ecoverse?.community?.id}
          credential={AuthorizationCredential.ChallengeMember}
          resourceId={challengeId}
          accessedFrom="challenge"
        />
      </Route>
      <Route path={`${path}/opportunities`}>
        <OpportunitiesRoute paths={currentPaths} />
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
