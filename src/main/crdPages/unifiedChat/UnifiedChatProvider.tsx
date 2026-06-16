import { createContext, type ReactNode, useContext, useState } from 'react';
import { useGuidanceVcId } from '@/main/guidance/chatWidget/useGuidanceVcId';
import { UserMessagingProvider, useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

// Re-export so the still-mounted MUI UserMessagingDialog and the reused messaging
// hooks keep resolving the same context while the design-version toggle is OFF.
export { useUserMessagingContext };

type UnifiedChatContextProps = {
  /** Whether a platform Guidance assistant exists (a well-known guidance VC is configured). */
  guidanceEnabled: boolean;
  /** The well-known guidance VC id, used to detect + style + pin the guidance conversation. */
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
  const { guidanceVcId } = useGuidanceVcId({ skip: !isEnabled || !isOpen });
  const [guidanceConversationId, setGuidanceConversationId] = useState<string | null>(null);

  // Detection is based on the platform-level well-known guidance VC id (null when
  // guidance isn't configured). We intentionally do NOT additionally gate by the
  // GuidenceEngine flag / AccessInteractiveGuidance privilege here: the unified
  // list only surfaces conversations that already exist, and a guidance
  // conversation only exists if guidance was available to the user — so an
  // existing guidance chat must always be recognised (styled, pinned, clearable).
  const guidanceEnabled = Boolean(guidanceVcId);

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
