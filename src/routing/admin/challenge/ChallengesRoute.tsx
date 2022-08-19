import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import FormMode from '../../../components/Admin/FormMode';
import { ChallengeProvider } from '../../../context/ChallengeProvider';
import { Error404, PageProps } from '../../../pages';
import EditChallengePage from '../../../pages/Admin/Challenge/EditChallengePage';
import { nameOfUrl } from '../../url-params';
import { ChallengeRoute } from './ChallengeRoute';
import ChallengeListPage from '../../../pages/Admin/Hub/HubChallenges/ChallengeListPage';
import HubSettingsLayout from '../../../domain/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../domain/admin/layout/EntitySettings/constants';

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
