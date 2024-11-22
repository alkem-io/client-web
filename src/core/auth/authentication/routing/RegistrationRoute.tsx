import { Route, Routes } from 'react-router-dom';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import RegistrationPage from '../pages/RegistrationPage';
import RegistrationSuccessPage from '../pages/RegistrationSuccessPage';

export const RegistrationRoute = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <NotAuthenticatedRoute>
            <RegistrationPage flow={flow} />
          </NotAuthenticatedRoute>
        }
      />
      <Route path={'success'} element={<RegistrationSuccessPage />} />
    </Routes>
  );
};

export default RegistrationRoute;
