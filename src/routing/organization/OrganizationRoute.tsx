import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { useResolvedPath } from 'react-router-dom';
import { Loading } from '../../components/core';
import { EntityPageLayoutHolder } from '../../domain/shared/layout/PageLayout';
import { useOrganization } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import OrganizationPage from '../../pages/Organization/OrganizationPage';

const OrganizationRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { organization, displayName, loading } = useOrganization();

  const rootPaths = useMemo(() => [{ value: '/', name: 'organization', real: false }], [paths]);
  const currentPaths = useMemo(
    () => (organization ? [...rootPaths, { value: url, name: displayName, real: true }] : rootPaths),
    [rootPaths, displayName]
  );

  if (loading) return <Loading />;

  if (!organization) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<OrganizationPage paths={currentPaths} />}></Route>
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default OrganizationRoute;
