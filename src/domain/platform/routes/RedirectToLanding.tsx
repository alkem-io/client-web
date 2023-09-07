import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from './constants';
import { useConfig } from '../config/useConfig';
import { FEATURE_LANDING_PAGE } from '../config/features.constants';
import { useInnovationHubQuery } from '../../../core/apollo/generated/apollo-hooks';

const RedirectToLanding = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();
  const { data: customHomepageData, loading: loadingCustomHomepage } = useInnovationHubQuery();
  const navigate = useNavigate();

  const isOnCustomHomepage = !!customHomepageData?.platform.innovationHub;

  useLayoutEffect(() => {
    if (!isFeatureEnabled(FEATURE_LANDING_PAGE)) {
      navigate(ROUTE_HOME);
      return;
    }

    if (loadingAuthentication || loadingCustomHomepage) {
      return;
    }

    if (isAuthenticated || isOnCustomHomepage) {
      navigate(ROUTE_HOME);
    } else {
      window.location.replace('/landing');
    }
  }, [isAuthenticated, loadingAuthentication, isFeatureEnabled, loadingCustomHomepage, isOnCustomHomepage]);

  return null;
};

export default RedirectToLanding;
