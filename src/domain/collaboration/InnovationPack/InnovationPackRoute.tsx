import React from 'react';
import { Route, Routes } from 'react-router';
import { EntityPageLayoutHolder } from '../../challenge/common/EntityPageLayout';
import { Error404 } from '../../../core/pages/Errors/Error404';
import InnovationPackProfilePage from './InnovationPackProfilePage/InnovationPackProfilePage';

const InnovationPackRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<EntityPageLayoutHolder />}>
        <Route path=":innovationPackNameId" element={<InnovationPackProfilePage />} />
        <Route path=":innovationPackNameId/settings" element={<InnovationPackProfilePage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default InnovationPackRoute;
