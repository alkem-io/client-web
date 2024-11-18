import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticationContext } from '../auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';

export const NotAuthenticatedRoute: FC = ({ children }) => {
  const { isAuthenticated } = useAuthenticationContext();

  if (isAuthenticated) return <Navigate to={ROUTE_HOME} />;

  return <>{children}</>;
};
