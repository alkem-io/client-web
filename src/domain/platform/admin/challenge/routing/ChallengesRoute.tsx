import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../main/routing/urlParams';
import { ChallengeProvider } from '../../../../journey/challenge/context/ChallengeProvider';
import ChallengeListPage from '../../../../journey/space/pages/SpaceChallenges/ChallengeListPage';
import { ChallengeRoute } from './ChallengeRoute';

export const ChallengesRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<ChallengeListPage routePrefix="../../" />} />
      <Route
        path={`:${nameOfUrl.challengeNameId}/*`}
        element={
          <ChallengeProvider>
            <ChallengeRoute />
          </ChallengeProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
