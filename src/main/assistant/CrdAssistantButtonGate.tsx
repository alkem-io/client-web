import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssistantContext } from './AssistantContext';
import { useAssistantEnabled } from './useAssistantEnabled';

/**
 * The assistant entry-point button on CRD pages. Rendered inside the same
 * FloatingActionButtons stack as the help/guidance chat launcher (root.tsx) and
 * styled to match it: a primary-filled circle (same 60px size as the
 * react-chat-widget launcher) with the white ✨ icon. No-ops unless the user is
 * authenticated and the assistant flag is on. The MUI nav embeds its own
 * (nav-styled) AssistantButton instead.
 */
export const CrdAssistantButtonGate = () => {
  const { t } = useTranslation();
  const isEnabled = useAssistantEnabled();
  const { setIsOpen } = useAssistantContext();

  if (!isEnabled) {
    return null;
  }

  return (
    <IconButton
      onClick={() => setIsOpen(true)}
      aria-label={t('assistant.openButton')}
      sx={theme => ({
        width: 60,
        height: 60,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: '0 2px 10px 1px rgba(0, 0, 0, 0.2)',
        '&:hover': { backgroundColor: theme.palette.primary.dark },
      })}
    >
      <AutoAwesomeIcon fontSize="large" />
    </IconButton>
  );
};
