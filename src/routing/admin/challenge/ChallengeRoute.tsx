import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import FormMode from '../../../components/Admin/FormMode';
import { managementData } from '../../../components/Admin/managementData';
import { useChallenge, useHub } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import EditChallengePage from '../../../pages/Admin/Challenge/EditChallengePage';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildChallengeUrl } from '../../../utils/urlBuilders';
import { CommunityRoute } from '../community';
import { OpportunitiesRoute } from '../opportunity/OpportunitiesRoute';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import { ChallengeLifecycleRoute } from './ChallengeLifecycleRoute';
import ChallengeVisualsPage from '../../../pages/Admin/Challenge/ChallengeVisualsPage';

export const ChallengeRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');
  const { hub, loading: loadingHub } = useHub();
  const { challenge, displayName, hubNameId, challengeId, challengeNameId, loading: loadingChallenge } = useChallenge();
  const loading = loadingHub || loadingChallenge;

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName || '', real: true }],
    [paths, displayName]
  );

  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <ManagementPageTemplatePage
              data={managementData.challengeLvl}
              paths={currentPaths}
              title={displayName}
              entityUrl={buildChallengeUrl(hubNameId, challengeNameId)}
              loading={loading}
            />
          }
        />
        <Route
          path={'edit'}
          element={
            <EditChallengePage
              mode={FormMode.update}
              paths={currentPaths}
              title={t('navigation.admin.challenge.edit')}
            />
          }
        />
        <Route path={'visuals'} element={<ChallengeVisualsPage paths={currentPaths} />} />
        <Route
          path={'community/*'}
          element={
            <CommunityRoute
              paths={currentPaths}
              communityId={challenge?.community?.id}
              parentCommunityId={hub?.community?.id}
              credential={AuthorizationCredential.ChallengeMember}
              resourceId={challengeId}
              accessedFrom="challenge"
            />
          }
        />
        <Route path={'opportunities/*'} element={<OpportunitiesRoute paths={currentPaths} />} />
        <Route
          path={'authorization/*'}
          element={<ChallengeAuthorizationRoute paths={currentPaths} resourceId={challengeId} />}
        />
        <Route path={'lifecycle'} element={<ChallengeLifecycleRoute paths={currentPaths} />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
