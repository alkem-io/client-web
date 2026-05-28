import { useEffect } from 'react';
import type { InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import { InnovationHubHome } from '@/crd/components/innovationHub/InnovationHubHome';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import { useHubWidthPreference } from './hooks/useHubWidthPreference';
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
    const { hostname, protocol } = window.location;
    // Skip if we're already on the right subdomain. Heuristic: the hostname
    // starts with `${subdomain}.`. Conservative — we only redirect when the
    // current host clearly isn't the subdomain.
    if (hostname.startsWith(`${hubSubdomain}.`)) return;
    const domain = hostname.split('.').slice(-2).join('.');
    if (!domain) return;
    window.location.replace(`${protocol}//${hubSubdomain}.${domain}`);
  }, [hubSubdomain, isPathEntry, ready]);
}

const CrdInnovationHubHomePage = ({ innovationHubFromSubdomain }: CrdInnovationHubHomePageProps) => {
  const { innovationHubId, loading: resolverLoading } = useUrlResolver();
  useEnableSpaceFullWidth();

  const input = innovationHubFromSubdomain
    ? ({ kind: 'bySubdomain', hub: innovationHubFromSubdomain } as const)
    : ({ kind: 'byId', id: innovationHubId ?? '' } as const);

  const { data, loading, hub } = useInnovationHubHomeData(input);
  const { wide: fullWidth, toggle: toggleFullWidth } = useHubWidthPreference(hub?.id);
  useRedirectToHubSubdomain(hub?.subdomain, input.kind === 'byId', !loading && !resolverLoading);

  if (resolverLoading || loading || !data) {
    return <Loading />;
  }

  return <InnovationHubHome data={data} fullWidth={fullWidth} onToggleFullWidth={toggleFullWidth} />;
};

export default CrdInnovationHubHomePage;
