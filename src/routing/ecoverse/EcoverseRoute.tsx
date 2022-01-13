import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityProvider } from '../../context/CommunityProvider';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Ecoverse as EcoversePage, Error404, PageProps } from '../../pages';
import EcoverseDashboardPage from '../../pages/Ecoverse/EcoverseDashboardPage';
import ApplyRoute from '../application/apply.route';
import ChallengeRoute from '../challenge/ChallengeRoute';
import { nameOfUrl } from '../url-params';
import EcoverseTabs from './EcoverseTabs';

const currentPaths = [];

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { ecoverse, displayName, loading: ecoverseLoading } = useEcoverse();
  const resolved = useResolvedPath('./');
  const currentPaths = useMemo(
    () => (ecoverse ? [...paths, { value: resolved.pathname, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  const loading = ecoverseLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverse) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path={'/'} element={<EcoverseTabs />}>
        <Route index element={<Navigate to={'dashboard'} />} />
        <Route path={'dashboard'} element={<EcoverseDashboardPage paths={currentPaths} />} />
        <Route path={'context'} element={<div>context</div>} />
        <Route path={'community'} element={<div>community</div>} />
        <Route path={'community/discussions'} element={<div>discussions</div>} />
        <Route path={'discussions'} element={<div>discussions</div>} />
        <Route path={'canvases'} element={<div>canvases</div>} />
        <Route path={'challenges'}>
          <Route
            path={`:${nameOfUrl.challengeNameId}`}
            element={
              <ChallengeProvider>
                <CommunityProvider>
                  <ChallengeRoute paths={currentPaths} />
                </CommunityProvider>
              </ChallengeProvider>
            }
          ></Route>
        </Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
      <Route path={'apply'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />}></Route>
    </Routes>
  );
};
