import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useOpportunity } from '../../hooks';
import { Error404, OpportunityPage, PageProps } from '../../pages';
import { ProjectRoute } from './ProjectRoute';

interface OpportunityRootProps extends PageProps {}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths }) => {
  const { opportunity, displayName, loading } = useOpportunity();
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [...paths, { value: url, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  if (!opportunity) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<Navigate to={'dashboard'} />}></Route>
        {/* /projects should be matched by the generic route, not this one. */}
        <Route path={'projects/'} element={<ProjectRoute paths={currentPaths} />}></Route>
        <Route path={'*'} element={<OpportunityPage paths={currentPaths} />}></Route>
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default OpportunityRoute;
