import { Route, Routes, useResolvedPath } from 'react-router-dom';
import SpaceTemplatesAdminPage from './SpaceAdminTemplatesPage';
import { SettingsPageProps } from '../../platform/admin/layout/EntitySettingsLayout/types';
import { nameOfUrl } from '@/main/routing/urlParams';

interface SpaceTemplatesAdminRoutesProps extends SettingsPageProps {
  spaceId: string;
}

const SpaceTemplatesAdminRoutes = (props: SpaceTemplatesAdminRoutesProps) => {
  const { pathname: url } = useResolvedPath('.');

  return (
    <Routes>
      <Route index element={<SpaceTemplatesAdminPage {...props} routePrefix={url} />} />
      <Route path={`:${nameOfUrl.templateNameId}`} element={<SpaceTemplatesAdminPage {...props} routePrefix={url} />} />
    </Routes>
  );
};

export default SpaceTemplatesAdminRoutes;
