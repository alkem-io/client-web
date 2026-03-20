import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { nameOfUrl } from '@/main/routing/urlParams';
import type { SettingsPageProps } from '../../platformAdmin/layout/EntitySettingsLayout/types';
import SpaceTemplatesAdminPage from './SpaceAdminTemplatesPage';

interface SpaceTemplatesAdminRoutesProps extends SettingsPageProps {
  spaceId: string;
}

const SpaceTemplatesAdminRoutes = (props: SpaceTemplatesAdminRoutesProps) => {
  const { pathname: url } = useResolvedPath('.');

  return (
    <Routes>
      <Route index={true} element={<SpaceTemplatesAdminPage {...props} routePrefix={url} />} />
      <Route path={`:${nameOfUrl.templateNameId}`} element={<SpaceTemplatesAdminPage {...props} routePrefix={url} />} />
    </Routes>
  );
};

export default SpaceTemplatesAdminRoutes;
