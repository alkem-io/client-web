import React from 'react';
import { Route, Routes } from 'react-router';
import { EntityPageLayoutHolder } from '../../challenge/common/EntityPageLayout';
import { Error404 } from '../../../core/pages/Errors/Error404';
import InnovationPackProfilePage from './InnovationPackProfilePage/InnovationPackProfilePage';
import AdminInnovationPackPage, {
  RoutePaths,
} from '../../platform/admin/templates/InnovationPacks/admin/AdminInnovationPackPage';
import { nameOfUrl } from '../../../core/routing/urlParams';

const InnovationPackRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<EntityPageLayoutHolder />}>
        <Route path={`:${nameOfUrl.innovationPackNameId}`} element={<InnovationPackProfilePage />} />
        <Route path={`:${nameOfUrl.innovationPackNameId}/settings`} element={<AdminInnovationPackPage />} />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/${RoutePaths.postTemplatesRoutePath}/:${nameOfUrl.postNameId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/${RoutePaths.whiteboardTemplatesRoutePath}/:${nameOfUrl.whiteboardNameId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackNameId}/${RoutePaths.innovationTemplatesRoutePath}/:${nameOfUrl.innovationTemplateId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default InnovationPackRoute;
