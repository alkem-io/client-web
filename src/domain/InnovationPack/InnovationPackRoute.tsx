import React from 'react';
import { Route, Routes } from 'react-router';
import { PageLayoutHolderWithOutlet } from '../journey/common/EntityPageLayout';
import { Error404 } from '../../core/pages/Errors/Error404';
import InnovationPackProfilePage from './InnovationPackProfilePage/InnovationPackProfilePage';
import AdminInnovationPackPage from './admin/AdminInnovationPackPage';
import { nameOfUrl } from '../../main/routing/urlParams';

const InnovationPackRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<PageLayoutHolderWithOutlet />}>
        <Route path={`:${nameOfUrl.innovationPackNameId}`} element={<InnovationPackProfilePage />} />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/:${nameOfUrl.templateNameId}`}
          element={<InnovationPackProfilePage />}
        />
        <Route path={`:${nameOfUrl.innovationPackNameId}/settings`} element={<AdminInnovationPackPage />} />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/settings/:${nameOfUrl.templateNameId}`}
          element={<AdminInnovationPackPage />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default InnovationPackRoute;
