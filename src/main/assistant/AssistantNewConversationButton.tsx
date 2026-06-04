import MarkChatUnreadOutlinedIcon from '@mui/icons-material/MarkChatUnreadOutlined';
import { Button, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Caption } from '@/core/ui/typography';

/**
 * "New conversation" action for the assistant panel. Mirrors the guidance chat's
 * new-thread button (main/guidance/chatWidget/ChatWidgetNewThreadButton): a
 * contained icon button anchored top-left of the header that animates open on
 * hover to reveal its label. Starting a new conversation is non-destructive
 * (the previous thread stays as history), so — unlike the guidance "clear" —
 * there is no confirmation step.
 */
const AnimatedButton = styled(Button)(() => ({
  justifyContent: 'flex-start',
  transition: 'width 0.3s ease',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  minWidth: '50px',
  width: 0,
  position: 'relative',
  '&:hover': {
    width: '180px',
  },
  '.caption': {
    position: 'absolute',
    left: '50px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
}));

const AssistantNewConversationButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <AnimatedButton variant="contained" onClick={onClick} aria-label={t('assistant.newConversation')}>
      <MarkChatUnreadOutlinedIcon className="icon" fontSize="small" />
      <Caption className="caption" textTransform="none">
        {t('assistant.newConversation')}
      </Caption>
    </AnimatedButton>
  );
};

export default AssistantNewConversationButton;
