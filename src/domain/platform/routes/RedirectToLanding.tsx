import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { ROUTE_HOME } from './constants';
import { useConfig } from '../config/useConfig';
import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import useLandingUrl from '@/main/landing/useLandingUrl';
import useNavigate from '@/core/routing/useNavigate';
import { useHomeRedirect } from './useHomeRedirect';

const RedirectToLanding = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();
  const { innovationHub, innovationHubLoading } = useInnovationHub();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnCustomHomepage = !!innovationHub;

  const landingUrl = useLandingUrl();

  const { loading: loadingHomeRedirect, redirectUrl } = useHomeRedirect(isAuthenticated);

  useLayoutEffect(() => {
    const homeRoute = `${ROUTE_HOME}${location.search}`;

    // Wait for loading states to resolve
    if (loadingAuthentication || innovationHubLoading) {
      return;
    }

    // For authenticated users, wait for redirect data and apply redirect logic
    if (isAuthenticated) {
      if (loadingHomeRedirect) {
        return;
      }
      if (redirectUrl) {
        navigate(`${redirectUrl}${location.search}`);
        return;
      }
      navigate(homeRoute);
      return;
    }

    // For non-authenticated users, handle landing page feature flag
    if (!isFeatureEnabled(PlatformFeatureFlagName.LandingPage)) {
      navigate(homeRoute);
      return;
    }

    if (isOnCustomHomepage) {
      navigate(homeRoute);
    } else if (landingUrl) {
      window.location.replace(landingUrl);
    }
  }, [
    isAuthenticated,
    loadingAuthentication,
    isFeatureEnabled,
    innovationHubLoading,
    isOnCustomHomepage,
    landingUrl,
    loadingHomeRedirect,
    redirectUrl,
    location.search,
    navigate,
  ]);

  return null;
};

export default RedirectToLanding;
