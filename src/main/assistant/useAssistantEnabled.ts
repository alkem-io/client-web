import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { env } from '@/main/env';

/**
 * Gate for the AI assistant UI: render nothing unless the user is authenticated
 * **and** the feature flag is on (mirrors the user-messaging / guidance-widget
 * gating). The flag is the client `VITE_APP_ASSISTANT_ENABLED` env var
 * (config-and-secrets.md; v1 decision — a server PlatformFeatureFlagName is a
 * later enhancement). Ships OFF; the PROD rollout flips it ON.
 */
export const useAssistantEnabled = (): boolean => {
  const { userModel } = useCurrentUserContext();
  const isAuthenticated = !!userModel?.id;
  const flagOn = env?.VITE_APP_ASSISTANT_ENABLED === 'true';
  return isAuthenticated && flagOn;
};
