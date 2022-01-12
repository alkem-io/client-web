import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { CommunityProvider } from '../../context/CommunityProvider';
import { OpportunityProvider } from '../../context/OpportunityProvider';
import { useChallenge } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { ChallengePage, Error404, PageProps } from '../../pages';
import ApplyRoute from '../application/apply.route';
import OpportunityRoute from '../opportunity/OpportunityRoute';
import { nameOfUrl } from '../url-params';

interface ChallengeRootProps extends PageProps {}

const ChallengeRoute: FC<ChallengeRootProps> = ({ paths }) => {
  const { challengeId, displayName, loading } = useChallenge();

  const url = '';
  const currentPaths = useMemo(
    () => (displayName ? [...paths, { value: url, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challengeId) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route>
        <Navigate to={'dashboard'} />
      </Route>
      <Route path={`opportunities/:${nameOfUrl.opportunityNameId}`}>
        <OpportunityProvider>
          <CommunityProvider>
            <OpportunityRoute paths={currentPaths} />
          </CommunityProvider>
        </OpportunityProvider>
      </Route>
      <Route path={'apply'}>
        <ApplyRoute type={ApplicationTypeEnum.challenge} paths={paths} />
      </Route>
      <Route path={'/'}>
        <ChallengePage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default ChallengeRoute;
