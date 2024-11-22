import { Route, Routes, useResolvedPath } from 'react-router-dom';
import SpaceTemplatesAdminPage from './SpaceTemplatesAdminPage';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import { nameOfUrl } from '@/main/routing/urlParams';

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
        path={`:${nameOfUrl.templateNameId}`}
        element={<SpaceTemplatesAdminPage {...props} routePrefix={url} {...RoutePaths} />}
      />
    </Routes>
  );
};

export default SpaceTemplatesAdminRoutes;
