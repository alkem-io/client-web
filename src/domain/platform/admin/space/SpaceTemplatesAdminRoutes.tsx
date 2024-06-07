import { Route, Routes, useResolvedPath } from 'react-router-dom';
import SpaceTemplatesAdminPage from './SpaceTemplatesAdminPage';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';

interface SpaceTemplatesAdminRoutesProps extends SettingsPageProps {
  spaceId: string;
}

enum RoutePaths {
  calloutTemplatesRoutePath = 'callout-templates',
  postTemplatesRoutePath = 'post-templates',
  whiteboardTemplatesRoutePath = 'whiteboard-templates',
  innovationTemplatesRoutePath = 'innovation-templates',
  communityGuidelinesTemplatesRoutePath = 'community-guidelines-templates',
}

const SpaceTemplatesAdminRoutes = (props: SpaceTemplatesAdminRoutesProps) => {
  const { pathname: url } = useResolvedPath('.');

  return (
    <Routes>
      <Route index element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />} />
      <Route
        path={`${RoutePaths.calloutTemplatesRoutePath}/:calloutTemplateId`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.calloutTemplatesRoutePath}/:calloutTemplateId/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
      <Route
        path={`${RoutePaths.postTemplatesRoutePath}/:postTemplateId`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.postTemplatesRoutePath}/:postTemplateId/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
      <Route
        path={`${RoutePaths.whiteboardTemplatesRoutePath}/:whiteboardTemplateId`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.whiteboardTemplatesRoutePath}/:whiteboardTemplateId/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
      <Route
        path={`${RoutePaths.innovationTemplatesRoutePath}/:innovationTemplateId`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.innovationTemplatesRoutePath}/:innovationTemplateId/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
      <Route
        path={`${RoutePaths.communityGuidelinesTemplatesRoutePath}/:communityGuidelinesTemplateId`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.communityGuidelinesTemplatesRoutePath}/:communityGuidelinesTemplateId/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} edit />}
      />
    </Routes>
  );
};

export default SpaceTemplatesAdminRoutes;
