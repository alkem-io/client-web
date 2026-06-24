import { MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

/**
 * "New conversation" action for the assistant panel. Mirrors the guidance chat's
 * new-thread button: a contained icon button anchored top-left of the header that
 * animates open on hover to reveal its label. Starting a new conversation is
 * non-destructive (the previous thread stays as history), so — unlike the
 * guidance "clear" — there is no confirmation step.
 */
const AssistantNewConversationButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onClick}
      aria-label={t('assistant.newConversation')}
      // Collapsed to an icon-width button that expands on hover to reveal its
      // label (width transition mirrors the guidance chat new-thread button).
      className="group relative w-9 justify-start overflow-hidden whitespace-nowrap transition-[width] duration-300 ease-in-out hover:w-44"
    >
      <MessageSquarePlus className="size-4 shrink-0" aria-hidden={true} />
      <span className="text-caption opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {t('assistant.newConversation')}
      </span>
    </Button>
  );
};

export default AssistantNewConversationButton;
