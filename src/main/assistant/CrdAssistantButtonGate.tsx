import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { useAssistantContext } from './AssistantContext';
import { useAssistantEnabled } from './useAssistantEnabled';

/**
 * The assistant entry-point button on CRD pages. Self-positioned bottom-right,
 * stacked just above the unified-chat FloatingChatLauncher (root.tsx mounts both),
 * and styled to match it: a primary-filled 48px circle with the white ✨ icon.
 * No-ops unless the user is authenticated and the assistant flag is on. CRD is
 * the only runtime path, so there is no design-version gate — only auth + flag.
 */
export const CrdAssistantButtonGate = () => {
  const { t } = useTranslation();
  const isEnabled = useAssistantEnabled();
  const { setIsOpen } = useAssistantContext();

  if (!isEnabled) {
    return null;
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      aria-label={t('assistant.openButton')}
      // Sit above the 48px unified-chat launcher (bottom: 16px) with an 8px gap.
      className="fixed right-4 bottom-[calc(16px+48px+8px)] z-50 size-12 rounded-full shadow-[0_2px_10px_1px_rgba(0,0,0,0.2)]"
    >
      <Sparkles aria-hidden={true} />
    </Button>
  );
};
