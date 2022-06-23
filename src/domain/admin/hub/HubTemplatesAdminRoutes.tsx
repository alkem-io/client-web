import { Route, Routes, useResolvedPath } from 'react-router-dom';
import HubTemplatesAdminPage from './HubTemplatesAdminPage';
import { SettingsPageProps } from '../layout/EntitySettings/types';

interface HubTemplatesAdminRoutesProps extends SettingsPageProps {
  hubId: string;
}

enum RoutePaths {
  aspectTemplatesRoutePath = 'aspect-templates',
  canvasTemplatesRoutePath = 'canvas-templates',
}

const HubTemplatesAdminRoutes = (props: HubTemplatesAdminRoutesProps) => {
  const { pathname: url } = useResolvedPath('.');

  return (
    <Routes>
      <Route index element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />} />
      <Route
        path="aspect-templates/:aspectTemplateId"
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path="aspect-templates/:aspectTemplateId/edit"
        element={<HubTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
    </Routes>
  );
};

export default HubTemplatesAdminRoutes;
