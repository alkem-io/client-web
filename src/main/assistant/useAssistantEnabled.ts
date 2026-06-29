import { usePlatformAssistantAccessQuery } from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { env } from '@/main/env';

/**
 * Central gate for the AI assistant UI: render nothing unless the user is
 * authenticated, the feature flag is on, **and** the user holds the
 * `ACCESS_VIRTUAL_ASSISTANT` authorization privilege — surfaced as the gated
 * `Platform.virtualAssistantAccess` field (resolves `false`, non-throwing, for
 * users without the privilege). Every assistant cue (both nav entry buttons,
 * the lazy dialog, the US4 settings tab + route, the whiteboard rail) funnels
 * through this single hook, so the absence of the privilege hides *every* cue —
 * not a hardcoded list, not feature-flag-only (FR-027 /
 * contracts/assistant-access-and-budget.md §1).
 *
 * The flag is the client `VITE_APP_ASSISTANT_ENABLED` env var
 * (config-and-secrets.md). Ships OFF; the PROD rollout flips it ON. Access (the
 * privilege) is independent of the flag — both must hold.
 */
export const useAssistantEnabled = (): boolean => {
  const { userModel } = useCurrentUserContext();
  const isAuthenticated = !!userModel?.id;
  const flagOn = env?.VITE_APP_ASSISTANT_ENABLED === 'true';

  // Only resolve the privilege once auth + flag already hold, so we never fire
  // the query for signed-out users or while the feature is off.
  const { data } = usePlatformAssistantAccessQuery({
    skip: !isAuthenticated || !flagOn,
    fetchPolicy: 'cache-and-network',
  });
  const hasAccess = data?.platform.virtualAssistantAccess ?? false;

  return isAuthenticated && flagOn && hasAccess;
};
