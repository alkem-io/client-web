import React, { FC } from 'react';
import { Navigate, Route } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityProvider } from '../../context/CommunityProvider';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Ecoverse as EcoversePage, Error404, PageProps } from '../../pages';
import ApplyRoute from '../application/apply.route';
import ChallengeRoute from '../challenge/ChallengeRoute';
import { nameOfUrl } from '../url-params';

const currentPaths = [];

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { ecoverse, displayName, loading: ecoverseLoading } = useEcoverse();

  // const currentPaths = useMemo(
  //   () => (ecoverse ? [...paths, { value: url, name: displayName, real: true }] : paths),
  //   [paths, displayName]
  // );

  const loading = ecoverseLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverse) {
    return <Error404 />;
  }

  return (
    <Route path={'/'}>
      <Navigate to={'dashboard'} />
      <Route path={'challenges'}>
        <Route path={`:${nameOfUrl.challengeNameId}`}>
          <ChallengeProvider>
            <CommunityProvider>
              <ChallengeRoute paths={currentPaths} />
            </CommunityProvider>
          </ChallengeProvider>
        </Route>
      </Route>
      <Route path={'apply'}>
        <ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />
      </Route>
      <Route>
        <EcoversePage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Route>
  );
};
