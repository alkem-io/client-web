import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from './routes';

const RootRedirect = () => {
  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (loadingAuthentication) {
      return;
    }

    if (isAuthenticated) {
      navigate(ROUTE_HOME);
    } else {
      window.location.replace('/landing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loadingAuthentication]);

  return null;
};

export default RootRedirect;
