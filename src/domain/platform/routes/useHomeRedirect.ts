import { useMemo } from 'react';
import { useHomeRedirectDataQuery, useHomeSpaceLookupQuery } from '@/core/apollo/generated/apollo-hooks';

type HomeRedirectResult = {
  loading: boolean;
  redirectUrl: string | null;
};

export const useHomeRedirect = (isAuthenticated: boolean): HomeRedirectResult => {
  const { data, loading: loadingRedirectData } = useHomeRedirectDataQuery({
    skip: !isAuthenticated,
  });

  const l0Memberships = data?.me.spaceMembershipsHierarchical ?? [];
  const homeSpaceSettings = data?.me.user?.settings?.homeSpace;
  const homeSpaceId = homeSpaceSettings?.spaceID;
  const autoRedirect = homeSpaceSettings?.autoRedirect ?? false;

  const needsHomeSpaceLookup = l0Memberships.length !== 1 && !!homeSpaceId && autoRedirect;

  const { data: homeSpaceData, loading: loadingHomeSpace } = useHomeSpaceLookupQuery({
    variables: { spaceId: homeSpaceId! },
    skip: !needsHomeSpaceLookup,
  });

  const loading = loadingRedirectData || (needsHomeSpaceLookup && loadingHomeSpace);

  const redirectUrl = useMemo(() => {
    if (!data) return null;

    // Priority 1: Single L0 membership - redirect to that space
    if (l0Memberships.length === 1) {
      const singleSpace = l0Memberships[0];
      return singleSpace.space.about.profile.url ?? null;
    }

    // Priority 2: Multiple memberships with homeSpace and autoRedirect enabled
    if (l0Memberships.length > 1 && homeSpaceId && autoRedirect) {
      return homeSpaceData?.lookup.space?.about.profile.url ?? null;
    }

    // No redirect needed
    return null;
  }, [data, l0Memberships, homeSpaceId, autoRedirect, homeSpaceData]);

  return { loading, redirectUrl };
};
