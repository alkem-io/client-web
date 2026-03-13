import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { useAuthenticationContext } from '../auth/authentication/hooks/useAuthenticationContext';

export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuthenticationContext();

  if (isAuthenticated) return <Navigate to={ROUTE_HOME} />;

  return <>{children}</>;
};
