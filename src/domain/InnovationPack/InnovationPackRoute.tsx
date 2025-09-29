import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import InnovationPackProfilePage from './InnovationPackProfilePage/InnovationPackProfilePage';
import AdminInnovationPackPage from './admin/AdminInnovationPackPage';
import { nameOfUrl } from '@/main/routing/urlParams';

// TODO the Innovationpack layout is too heavily coupled with the innovation pack so it's kept iniside the pages rather than here
// will revise ASAP
const InnovationPackRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.innovationPackNameId}`} element={<InnovationPackProfilePage />} />
    <Route
      path={`:${nameOfUrl.innovationPackNameId}/:${nameOfUrl.templateNameId}`}
      element={<InnovationPackProfilePage />}
    />
    <Route path={`:${nameOfUrl.innovationPackNameId}/settings`} element={<AdminInnovationPackPage />} />
    <Route
      path={`:${nameOfUrl.innovationPackNameId}/settings/:${nameOfUrl.templateNameId}`}
      element={<AdminInnovationPackPage />}
    />
    <Route path="*" element={<Error404 />} />
  </Routes>
);
export default InnovationPackRoute;
