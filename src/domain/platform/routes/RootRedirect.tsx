import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from './routes';
import { useConfig } from '../config/useConfig';
import { FEATURE_LANDING_PAGE } from '../config/features.constants';

const RootRedirect = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!isFeatureEnabled(FEATURE_LANDING_PAGE)) {
      navigate(ROUTE_HOME);
      return;
    }

    if (loadingAuthentication) {
      return;
    }

    if (isAuthenticated) {
      navigate(ROUTE_HOME);
    } else {
      window.location.replace('/landing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loadingAuthentication, isFeatureEnabled]);

  return null;
};

export default RootRedirect;
