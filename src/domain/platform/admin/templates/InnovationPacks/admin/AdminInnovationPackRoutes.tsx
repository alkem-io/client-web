import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../../core/routing/urlParams';
import AdminInnovationPackPage from './AdminInnovationPackPage';
import AdminInnovationPacksPage from './AdminInnovationPacksPage';

export enum RoutePaths {
  aspectTemplatesRoutePath = 'aspect-templates',
  whiteboardTemplatesRoutePath = 'canvas-templates',
  innovationTemplatesRoutePath = 'innovation-templates',
}

const AdminInnovationPacksRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationPacksPage />} />
        <Route path="new" element={<AdminInnovationPackPage isNew />} />
        <Route path={`:${nameOfUrl.innovationPackNameId}`} element={<AdminInnovationPackPage />} />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/${RoutePaths.aspectTemplatesRoutePath}/:${nameOfUrl.aspectNameId}`}
          element={<AdminInnovationPackPage edit />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/${RoutePaths.whiteboardTemplatesRoutePath}/:${nameOfUrl.canvasNameId}`}
          element={<AdminInnovationPackPage edit />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/${RoutePaths.innovationTemplatesRoutePath}/:${nameOfUrl.innovationTemplateId}`}
          element={<AdminInnovationPackPage edit />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminInnovationPacksRoutes;
