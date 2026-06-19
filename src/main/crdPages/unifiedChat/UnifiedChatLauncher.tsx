import { useTranslation } from 'react-i18next';
import { trackChatOpen } from '@/core/analytics/events/unifiedChat';
import { FloatingChatLauncher } from '@/crd/components/chat/FloatingChatLauncher';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

type UnifiedChatLauncherProps = {
  /** Suppressed on auth routes / fullscreen editors (decided by the mount site). */
  hidden?: boolean;
};

/**
 * The single floating chat entry point for CRD pages: the launcher button plus
 * the (open-only) panel. The unread badge while closed comes from the lightweight
 * unread-count query; when open, the full conversations query is authoritative.
 */
export const UnifiedChatLauncher = ({ hidden }: UnifiedChatLauncherProps) => {
  const { t } = useTranslation('crd-chat');
  const { isEnabled, isOpen, setIsOpen } = useUserMessagingContext();
  const { isSmallScreen } = useScreenSize();
  const unreadCount = useUnreadConversationsCount();

  if (!isEnabled || hidden) {
    return null;
  }

  return (
    <>
      <FloatingChatLauncher
        unreadCount={unreadCount}
        isOpen={isOpen}
        hidden={isSmallScreen && isOpen}
        onClick={() => {
          if (!isOpen) trackChatOpen('floatingButton');
          setIsOpen(!isOpen);
        }}
        openLabel={t('launcher.open')}
        closeLabel={t('launcher.close')}
        unreadLabel={t('launcher.unreadLabel')}
      />
      {isOpen && <UnifiedChatPanelConnector />}
    </>
  );
};
