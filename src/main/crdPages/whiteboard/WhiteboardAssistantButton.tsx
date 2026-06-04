import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { useAssistantContext } from '@/main/assistant/AssistantContext';
import { useAssistantEnabled } from '@/main/assistant/useAssistantEnabled';

type WhiteboardAssistantButtonProps = {
  whiteboard: { id: string; profile: { displayName?: string } };
};

/**
 * Whiteboard-editor header affordance that opens the AI assistant panel scoped
 * to the current whiteboard (`workspace#004-web-ai-assistant`). The CRD-legal
 * sparkle is the assistant's visual identity. Scoping is per-turn and optional:
 * it only lets the model resolve an ambiguous "this whiteboard" to this board's
 * id — writes still go through the US2 confirmation gate.
 *
 * Renders nothing unless the assistant is enabled (auth + feature flag), mirroring
 * the global panel's gate.
 */
export function WhiteboardAssistantButton({ whiteboard }: WhiteboardAssistantButtonProps) {
  const { t } = useTranslation();
  const isEnabled = useAssistantEnabled();
  const { openForWhiteboard } = useAssistantContext();

  if (!isEnabled) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => openForWhiteboard({ whiteboardId: whiteboard.id, displayName: whiteboard.profile?.displayName })}
      aria-label={t('assistant.openInWhiteboard')}
      title={t('assistant.openInWhiteboard')}
    >
      <Sparkles />
    </Button>
  );
}
