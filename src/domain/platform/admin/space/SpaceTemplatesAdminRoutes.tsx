import { Route, Routes, useResolvedPath } from 'react-router-dom';
import SpaceTemplatesAdminPage from './SpaceTemplatesAdminPage';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import { nameOfUrl } from '../../../../main/routing/urlParams';

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
        path={`${RoutePaths.calloutTemplatesRoutePath}/:${nameOfUrl.calloutTemplateId}`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.calloutTemplatesRoutePath}/:${nameOfUrl.calloutTemplateId}/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} editTemplateMode />}
      />
      <Route
        path={`${RoutePaths.postTemplatesRoutePath}/:${nameOfUrl.postNameId}`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.postTemplatesRoutePath}/:${nameOfUrl.postNameId}/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} editTemplateMode />}
      />
      <Route
        path={`${RoutePaths.whiteboardTemplatesRoutePath}/:${nameOfUrl.whiteboardNameId}`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.whiteboardTemplatesRoutePath}/:${nameOfUrl.whiteboardNameId}/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} editTemplateMode />}
      />
      <Route
        path={`${RoutePaths.innovationTemplatesRoutePath}/:${nameOfUrl.innovationTemplateId}`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.innovationTemplatesRoutePath}/:${nameOfUrl.innovationTemplateId}/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} editTemplateMode />}
      />
      <Route
        path={`${RoutePaths.communityGuidelinesTemplatesRoutePath}/:${nameOfUrl.communityGuidelinesNameId}`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
      <Route
        path={`${RoutePaths.communityGuidelinesTemplatesRoutePath}/:${nameOfUrl.communityGuidelinesNameId}/edit`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} editTemplateMode />}
      />
    </Routes>
  );
};

export default SpaceTemplatesAdminRoutes;
