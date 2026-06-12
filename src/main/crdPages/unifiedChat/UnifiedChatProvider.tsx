import { createContext, type ReactNode, useContext, useState } from 'react';
import { AuthorizationPrivilege, PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useGuidanceVcId } from '@/main/guidance/chatWidget/useGuidanceVcId';
import { UserMessagingProvider, useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

// Re-export so the still-mounted MUI UserMessagingDialog and the reused messaging
// hooks keep resolving the same context while the design-version toggle is OFF.
export { useUserMessagingContext };

type UnifiedChatContextProps = {
  /** Whether the Guidance assistant is available to this user. Refined with the
   *  feature flag + privilege check in US3 (T030); currently derived from the
   *  presence of a well-known guidance VC. */
  guidanceEnabled: boolean;
  guidanceVcId: string | null;
  /** The conversation id of the pinned Guidance thread, once resolved from the list. */
  guidanceConversationId: string | null;
  setGuidanceConversationId: (id: string | null) => void;
};

const UnifiedChatContext = createContext<UnifiedChatContextProps>({
  guidanceEnabled: false,
  guidanceVcId: null,
  guidanceConversationId: null,
  setGuidanceConversationId: () => {},
});

const UnifiedChatGuidanceProvider = ({ children }: { children: ReactNode }) => {
  const { isEnabled, isOpen } = useUserMessagingContext();
  const { isFeatureEnabled } = useConfig();
  const { platformPrivilegeWrapper } = useCurrentUserContext();
  const { guidanceVcId: resolvedGuidanceVcId } = useGuidanceVcId({ skip: !isEnabled || !isOpen });
  const [guidanceConversationId, setGuidanceConversationId] = useState<string | null>(null);

  // Guidance is available only with the feature flag AND the platform privilege
  // (mirrors PlatformHelpButton). When unavailable, the pinned row never appears.
  const guidanceAllowed =
    isFeatureEnabled(PlatformFeatureFlagName.GuidenceEngine) &&
    Boolean(platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.AccessInteractiveGuidance));

  const guidanceVcId = guidanceAllowed ? resolvedGuidanceVcId : null;
  const guidanceEnabled = guidanceAllowed && Boolean(resolvedGuidanceVcId);

  return (
    <UnifiedChatContext value={{ guidanceEnabled, guidanceVcId, guidanceConversationId, setGuidanceConversationId }}>
      {children}
    </UnifiedChatContext>
  );
};

/**
 * Provides unified-chat state. Wraps the existing UserMessagingProvider (which
 * holds isOpen/selection/unread/newly-created state) and adds Guidance-specific
 * state on top, so the legacy messaging consumers keep working unchanged.
 */
export const UnifiedChatProvider = ({ children }: { children: ReactNode }) => (
  <UserMessagingProvider>
    <UnifiedChatGuidanceProvider>{children}</UnifiedChatGuidanceProvider>
  </UserMessagingProvider>
);

export const useUnifiedChatContext = () => useContext(UnifiedChatContext);
