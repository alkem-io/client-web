import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';

import { PageProps } from '../../../../shared/types/PageProps';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../core/routing/url-params';
import { ChallengeProvider } from '../../../../challenge/challenge/context/ChallengeProvider';
import ChallengeListPage from '../../../../challenge/hub/pages/HubChallenges/ChallengeListPage';
import { ChallengeRoute } from './ChallengeRoute';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [paths, url]);

  return (
    <Routes>
      <Route index element={<ChallengeListPage paths={currentPaths} routePrefix="../../" />} />
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
