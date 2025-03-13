import { useCallback } from 'react';
import { Button, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Caption } from '@/core/ui/typography';
import MarkChatUnreadOutlinedIcon from '@mui/icons-material/MarkChatUnreadOutlined';

interface ChatWidgetNewThreadButtonProps {
  onClear: () => void;
}

const ChatWidgetNewThreadButton = ({ onClear }: ChatWidgetNewThreadButtonProps) => {
  const { t } = useTranslation();

  const AnimatedButton = styled(Button)(() => ({
    justifyContent: 'flex-start',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minWidth: '50px',
    width: 0,
    position: 'relative',
    marginRight: '8px',
    '&:hover': {
      width: '124px',
    },
    '.caption': {
      position: 'absolute',
      left: '50px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  }));

  const handleClear = useCallback(() => {
    onClear();
  }, [onClear]);

  return (
    <AnimatedButton variant="contained" onClick={handleClear}>
      <MarkChatUnreadOutlinedIcon className="icon" fontSize="small" />
      <Caption className="caption" textTransform="none">
        {t('chatbot.menu.clear')}
      </Caption>
    </AnimatedButton>
  );
};

export default ChatWidgetNewThreadButton;
