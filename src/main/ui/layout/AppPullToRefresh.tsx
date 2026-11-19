import { useApolloClient } from '@apollo/client';
import { isAppMode } from '@/core/appMode/isAppMode';
import useOnlineStatus from '@/core/utils/onlineStatus';
import { PullToRefresh } from '@/crd/components/common/PullToRefresh';

/**
 * Pull to refresh in the store app (workspace#109). Refetches the Apollo queries that are
 * active, so each page refreshes itself with no per-page wiring. App only: mobile browsers
 * have their own pull-to-refresh. Not rendered while offline: the online-status banner is
 * the one offline signal, and unmounting restores the native overscroll.
 */
export function AppPullToRefresh() {
  const client = useApolloClient();
  const isOnline = useOnlineStatus();
  if (!isAppMode() || !isOnline) return null;
  return <PullToRefresh onRefresh={() => client.refetchQueries({ include: 'active' })} />;
}
