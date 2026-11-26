import { useHomeRedirectMembershipsQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';

type HomeRedirectResult = {
  loading: boolean;
  redirectUrl: string | null;
};

export const useHomeRedirect = (isAuthenticated: boolean): HomeRedirectResult => {
  const { data: foundation } = useNativeFoundation();
  const { data, loading } = useHomeRedirectMembershipsQuery({ skip: !isAuthenticated });

  const redirectUrl = (() => {
    const actor = data?.viewer.actor;
    if (!actor) return null;
    // Legacy counted top-level memberships only (server me.service.ts:265-278); the list holds every depth.
    const topLevel = 'memberships' in actor ? actor.memberships.filter(membership => membership.space.depth === 0) : [];

    // Priority 1: Single L0 membership - redirect to that space
    if (topLevel.length === 1) return topLevel[0].space.url ?? null;

    // Priority 2: Multiple memberships with homeSpace and autoRedirect enabled
    const settings = foundation?.viewer.actor?.settings as { home_space?: { auto_redirect?: boolean } } | null;
    if (topLevel.length > 1 && settings?.home_space?.auto_redirect) return foundation?.viewer.homeSpace?.url ?? null;

    // No redirect needed
    return null;
  })();

  return { loading, redirectUrl };
};
