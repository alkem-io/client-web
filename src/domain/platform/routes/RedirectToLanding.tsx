import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from './constants';
import { useConfig } from '../config/useConfig';
import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import useLandingUrl from '@/main/landing/useLandingUrl';
import useNavigate from '@/core/routing/useNavigate';

const RedirectToLanding = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();
  const { innovationHub, innovationHubLoading } = useInnovationHub();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnCustomHomepage = !!innovationHub;

  const landingUrl = useLandingUrl();

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
    } else if (landingUrl) {
      window.location.replace(landingUrl);
    }
  }, [isAuthenticated, loadingAuthentication, isFeatureEnabled, innovationHubLoading, isOnCustomHomepage, landingUrl]);

  return null;
};

export default RedirectToLanding;
