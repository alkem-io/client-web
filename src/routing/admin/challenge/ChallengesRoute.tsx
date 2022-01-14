import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import FormMode from '../../../components/Admin/FormMode';
import { ChallengeProvider } from '../../../context/ChallengeProvider';
import { Error404, PageProps } from '../../../pages';
import ChallengeListPage from '../../../pages/Admin/Challenge/ChallengeListPage';
import EditChallengePage from '../../../pages/Admin/Challenge/EditChallengePage';
import { nameOfUrl } from '../../url-params';
import { ChallengeRoute } from './ChallengeRoute';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const url = '';

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [paths]);

  return (
    <Routes>
      <Route>
        <ChallengeListPage paths={currentPaths} />
      </Route>
      <Route path={'new'}>
        <EditChallengePage mode={FormMode.create} paths={currentPaths} title={t('navigation.admin.challenge.create')} />
      </Route>
      <Route path={`:${nameOfUrl.challengeNameId}`}>
        <ChallengeProvider>
          <ChallengeRoute paths={currentPaths} />
        </ChallengeProvider>
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
