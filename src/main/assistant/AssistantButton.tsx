import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { useAssistantContext } from './AssistantContext';
import { useAssistantEnabled } from './useAssistantEnabled';

/**
 * Entry point that opens the AI assistant panel. Rendered in the nav.
 * Renders nothing unless the user is authenticated and the feature flag is on
 * (useAssistantEnabled).
 */
export const AssistantButton = () => {
  const { t } = useTranslation();
  const isEnabled = useAssistantEnabled();
  const { setIsOpen, clearPanelContext } = useAssistantContext();

  if (!isEnabled) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      // Drop any stale whiteboard scope so the global panel always opens as the
      // dialog (its gate requires `panelContext === null`), never suppressed by a
      // board that was closed without collapsing its rail.
      onClick={() => {
        clearPanelContext();
        setIsOpen(true);
      }}
      aria-label={t('assistant.openButton')}
      className="text-primary"
    >
      <Sparkles aria-hidden={true} />
    </Button>
  );
};
