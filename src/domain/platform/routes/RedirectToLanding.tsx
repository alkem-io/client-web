import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import useNavigate from '@/core/routing/useNavigate';
import useLandingUrl from '@/main/landing/useLandingUrl';
import { useConfig } from '../config/useConfig';
import { ROUTE_HOME } from './constants';
import { useHomeRedirect } from './useHomeRedirect';

const RedirectToLanding = () => {
  const { isFeatureEnabled } = useConfig();
  const { data: foundation, loading: loadingAuthentication } = useNativeFoundation();
  const isAuthenticated = !!foundation?.viewer.session.authenticated;
  const location = useLocation();
  const navigate = useNavigate();

  const isOnCustomHomepage = !!foundation?.resolve?.homepage;

  const landingUrl = useLandingUrl();

  const { loading: loadingHomeRedirect, redirectUrl } = useHomeRedirect(isAuthenticated);

  useLayoutEffect(() => {
    const homeRoute = `${ROUTE_HOME}${location.search}`;

    // Wait for loading states to resolve; a failed foundation stays visible on `/`
    if (loadingAuthentication || !foundation) {
      return;
    }

    // On an innovation hub subdomain the hub home IS the landing page, for signed-in
    // visitors too — it must win over the home-space redirect below, which would
    // otherwise divert them off the hub they asked for. That redirect is also an
    // absolute main-domain `profile.url`: `normalizeLink` only strips the origin when
    // it matches the *current* one, so on a hub host it passes through intact and
    // react-router resolves it as a relative path — producing
    // `https://<hub>.alkem.io/https://alkem.io/space/<nameId>`, which the server URL
    // resolver rejects with NotFoundError.
    if (isOnCustomHomepage) {
      navigate(homeRoute);
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

    if (landingUrl) {
      window.location.replace(landingUrl);
    }
  }, [
    foundation,
    isAuthenticated,
    loadingAuthentication,
    isFeatureEnabled,
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
