import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import Loading from '../../../../../core/ui/loading/Loading';
import { EntityPageLayoutHolder } from '../../../../journey/common/EntityPageLayout';
import { useOrganization } from '../hooks/useOrganization';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import OrganizationPage from '../pages/OrganizationPage';

const OrganizationRoute: FC = () => {
  const { organization, loading } = useOrganization();

  if (loading) return <Loading />;

  if (!organization && !loading) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path="/" element={<EntityPageLayoutHolder />}>
        <Route index element={<OrganizationPage />} />
      </Route>
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OrganizationRoute;
