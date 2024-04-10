import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import VirtualContributorsPage from './VirtualContributorsPage';
import NewPersonaForm from './NewPersonaForm';
import NewVirtualContributorForm from './NewVirtualContributorForm';

const VirtualContributorsRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<VirtualContributorsPage />} />
        <Route path={'new-persona'} element={<NewPersonaForm parentPagePath="/admin/virtual-contributors" />} />
        <Route
          path={'new-virtual-contributor'}
          element={<NewVirtualContributorForm parentPagePath="/admin/virtual-contributors" />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default VirtualContributorsRoutes;