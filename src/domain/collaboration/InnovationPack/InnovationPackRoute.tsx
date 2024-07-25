import React from 'react';
import { Route, Routes } from 'react-router';
import { PageLayoutHolderWithOutlet } from '../../journey/common/EntityPageLayout';
import { Error404 } from '../../../core/pages/Errors/Error404';
import InnovationPackProfilePage from './InnovationPackProfilePage/InnovationPackProfilePage';
import AdminInnovationPackPage, {
  RoutePaths,
} from '../../platform/admin/templates/InnovationPacks/admin/AdminInnovationPackPage';
import { nameOfUrl } from '../../../main/routing/urlParams';

const InnovationPackRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<PageLayoutHolderWithOutlet />}>
        <Route path={`:${nameOfUrl.innovationPackId}`} element={<InnovationPackProfilePage />} />
        <Route path={`:${nameOfUrl.innovationPackId}/settings`} element={<AdminInnovationPackPage />} />
        <Route
          path={`:${nameOfUrl.innovationPackId}/${RoutePaths.postTemplatesRoutePath}/:${nameOfUrl.postNameId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackId}/${RoutePaths.whiteboardTemplatesRoutePath}/:${nameOfUrl.whiteboardNameId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackId}/${RoutePaths.calloutTemplatesRoutePath}/:${nameOfUrl.calloutTemplateId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackId}/${RoutePaths.innovationTemplatesRoutePath}/:${nameOfUrl.innovationTemplateId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route
          path={`:${nameOfUrl.innovationPackId}/${RoutePaths.communityGuidelinesTemplatesRoutePath}/:${nameOfUrl.communityGuidelinesNameId}`}
          element={<AdminInnovationPackPage editTemplates />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default InnovationPackRoute;
