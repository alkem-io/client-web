import { PanelsTopLeft } from 'lucide-react';
import { useEffect } from 'react';
import type { InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import Loading from '@/core/ui/loading/Loading';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { InnovationHubHome } from '@/crd/components/innovationHub/InnovationHubHome';
import { buildInnovationHubUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useEnableBannerOverlay } from '@/main/ui/layout/BannerOverlayContext';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import { useLayoutWidthPreference } from '@/main/ui/layout/useLayoutWidthPreference';
import { useInnovationHubHomeData } from './hooks/useInnovationHubHomeData';

type CrdInnovationHubHomePageProps = {
  /**
   * Pre-resolved hub passed by the `CrdHomePage` dispatcher (subdomain branch).
   * When omitted, the page resolves the hub by id from `useUrlResolver()`
   * (used by the `/hub/<slug>` path route).
   */
  innovationHubFromSubdomain?: InnovationHubHomeInnovationHubFragment;
};

/**
 * On production, when the visitor lands on the path-based `/hub/<slug>` route,
 * redirect them to the hub's dedicated subdomain so the URL bar reflects the
 * brand they're on. On development we skip the redirect (no real subdomains
 * exist on `localhost`).
 *
 * The subdomain branch (server already resolved the hub from the host header)
 * never triggers this effect because `innovationHubFromSubdomain` is set.
 */
function useRedirectToHubSubdomain(hubSubdomain: string | undefined, isPathEntry: boolean, ready: boolean) {
  useEffect(() => {
    if (!ready || !isPathEntry || !hubSubdomain) return;
    if (import.meta.env.MODE !== 'production') return;
    const { hostname } = window.location;
    // Skip if we're already on the right subdomain. Heuristic: the hostname
    // starts with `${subdomain}.`. Conservative — we only redirect when the
    // current host clearly isn't the subdomain.
    if (hostname.startsWith(`${hubSubdomain}.`)) return;
    // Subdomain origin building lives in urlBuilders (buildInnovationHubUrl).
    window.location.replace(buildInnovationHubUrl(hubSubdomain));
  }, [hubSubdomain, isPathEntry, ready]);
}

const CrdInnovationHubHomePage = ({ innovationHubFromSubdomain }: CrdInnovationHubHomePageProps) => {
  const { innovationHubId, loading: resolverLoading } = useUrlResolver();
  useEnableSpaceFullWidth();
  // Mirror the Spaces home: a banner-overlay topbar that goes transparent over
  // the banner until the user scrolls. The page slides under by `-mt-16`.
  useEnableBannerOverlay();

  const input = innovationHubFromSubdomain
    ? ({ kind: 'bySubdomain', hub: innovationHubFromSubdomain } as const)
    : ({ kind: 'byId', id: innovationHubId ?? '' } as const);

  const { data, spaces, loading, hub, spacesLoading } = useInnovationHubHomeData(input);
  const { wide: fullWidth, toggle: toggleFullWidth } = useLayoutWidthPreference();

  // The URL resolver is only consulted on the `/hub/<slug>` path entry (to get the
  // hub id). The subdomain entry already has the fully-resolved hub from the prop,
  // so it must NOT block on `resolverLoading` — on a real hub subdomain the resolver
  // never resolves `/home` to a handled type and its `loading` stays true forever.
  const isPathEntry = input.kind === 'byId';
  useRedirectToHubSubdomain(hub?.subdomain, isPathEntry, !loading && !resolverLoading);

  // Browser tab title: "[Hub Name] | Alkemio". Covers both entry points —
  // the subdomain branch (data from `innovationHubFromSubdomain`) and the
  // `/hub/<slug>` path branch (resolved by id) both funnel through here.
  usePageTitle(data?.name);

  // Top-bar breadcrumb: single `[PanelsTopLeft] HubName` chip, mirroring how
  // Space / User / Org public profile pages identify themselves in the topbar.
  const breadcrumbItems: BreadcrumbTrailItem[] = data ? [{ label: data.name, icon: PanelsTopLeft }] : [];
  useSetBreadcrumbs(breadcrumbItems);

  if ((isPathEntry && resolverLoading) || loading || !data) {
    return <Loading />;
  }

  return (
    <InnovationHubHome
      data={data}
      spaces={spaces}
      fullWidth={fullWidth}
      onToggleFullWidth={toggleFullWidth}
      overlayHeader={true}
      spacesLoading={spacesLoading}
    />
  );
};

export default CrdInnovationHubHomePage;
