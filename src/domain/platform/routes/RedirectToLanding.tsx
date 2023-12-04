import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from './constants';
import { useConfig } from '../config/useConfig';
import useInnovationHub from '../../innovationHub/useInnovationHub/useInnovationHub';
import { PlatformFeatureFlagName } from '../../../core/apollo/generated/graphql-schema';

const getLandingUrl = ({ host }: { host: string }) => `//welcome.${host}/`;

const RedirectToLanding = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();
  const { innovationHub, innovationHubLoading } = useInnovationHub();
  const location = useLocation();
  const navigate = useNavigate();
  const { locations } = useConfig();

  const isOnCustomHomepage = !!innovationHub;

  useLayoutEffect(() => {
    const homeRoute = `${ROUTE_HOME}${location.search}`;

    if (!isFeatureEnabled(PlatformFeatureFlagName.LandingPage)) {
      navigate(homeRoute);
      return;
    }

    if (loadingAuthentication || innovationHubLoading) {
      return;
    }

    if (isAuthenticated || isOnCustomHomepage) {
      navigate(homeRoute);
    } else if (locations) {
      window.location.replace(getLandingUrl({ host: locations.domain }));
    }
  }, [isAuthenticated, loadingAuthentication, isFeatureEnabled, innovationHubLoading, isOnCustomHomepage, locations]);

  return null;
};

export default RedirectToLanding;
