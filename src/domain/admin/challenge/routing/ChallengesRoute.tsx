import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import FormMode from '../../components/FormMode';
import { PageProps, Error404 } from '../../../../pages';
import { nameOfUrl } from '../../../../routing/url-params';
import { ChallengeProvider } from '../../../challenge/context/ChallengeProvider';
import EditChallengePage from '../../../challenge/pages/EditChallengePage';
import ChallengeListPage from '../../../hub/pages/HubChallenges/ChallengeListPage';
import HubSettingsLayout from '../../hub/HubSettingsLayout';
import { SettingsSection } from '../../layout/EntitySettings/constants';
import { ChallengeRoute } from './ChallengeRoute';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [paths]);

  return (
    <Routes>
      <Route index element={<ChallengeListPage paths={currentPaths} routePrefix="../../" />} />
      <Route
        path="new"
        element={
          <HubSettingsLayout currentTab={SettingsSection.Challenges} tabRoutePrefix={'../../'}>
            <EditChallengePage
              mode={FormMode.create}
              paths={currentPaths}
              title={t('navigation.admin.challenge.create')}
            />
          </HubSettingsLayout>
        }
      />
      <Route
        path={`:${nameOfUrl.challengeNameId}/*`}
        element={
          <ChallengeProvider>
            <ChallengeRoute paths={currentPaths} />
          </ChallengeProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
