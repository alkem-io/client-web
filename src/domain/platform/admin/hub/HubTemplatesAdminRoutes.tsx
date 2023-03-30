import { Route, Routes, useResolvedPath } from 'react-router-dom';
import HubTemplatesAdminPage from './HubTemplatesAdminPage';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';

interface HubTemplatesAdminRoutesProps extends SettingsPageProps {
  hubId: string;
}

enum RoutePaths {
  aspectTemplatesRoutePath = 'aspect-templates',
  whiteboardTemplatesRoutePath = 'canvas-templates',
  innovationTemplatesRoutePath = 'innovation-templates',
}

const HubTemplatesAdminRoutes = (props: HubTemplatesAdminRoutesProps) => {
  const { pathname: url } = useResolvedPath('.');

  return (
    <Routes>
      <Route index element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />} />
      <Route
        path={`${RoutePaths.aspectTemplatesRoutePath}/:aspectTemplateId`}
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.aspectTemplatesRoutePath}/:aspectTemplateId/edit`}
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
      <Route
        path={`${RoutePaths.whiteboardTemplatesRoutePath}/:whiteboardTemplateId`}
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.whiteboardTemplatesRoutePath}/:whiteboardTemplateId/edit`}
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
      <Route
        path={`${RoutePaths.innovationTemplatesRoutePath}/:innovationTemplateId`}
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.innovationTemplatesRoutePath}/:innovationTemplateId/edit`}
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
    </Routes>
  );
};

export default HubTemplatesAdminRoutes;
