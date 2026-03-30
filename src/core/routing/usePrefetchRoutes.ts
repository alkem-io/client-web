import { useEffect } from 'react';

/**
 * Prefetches JavaScript chunks for commonly navigated routes during browser idle time.
 * Uses dynamic import() which Vite resolves to the correct chunk URLs.
 * Runs once after initial page load to improve subsequent navigation speed.
 */
const usePrefetchRoutes = () => {
  useEffect(() => {
    const prefetch = () => {
      // Trigger dynamic imports for commonly visited routes.
      // These are fire-and-forget — we don't need the modules, just want the browser to cache the chunks.
      import('@/main/topLevelPages/Home/HomePage').catch(() => {});
      import('@/main/crdPages/spaces/SpaceExplorerPage').catch(() => {});
      import('@/domain/community/user/routing/UserRoute').catch(() => {});
      import('@/domain/community/user/ContributorsPage').catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 2000);
      return () => clearTimeout(id);
    }
  }, []);
};

export default usePrefetchRoutes;
