import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssistantContext } from './AssistantContext';
import { useAssistantEnabled } from './useAssistantEnabled';

/**
 * The assistant entry-point button on CRD pages. Self-positioned bottom-right,
 * stacked just above the unified-chat FloatingChatLauncher (root.tsx mounts both),
 * and styled to match it: a primary-filled 48px circle with the white ✨ icon.
 * No-ops unless the user is authenticated and the assistant flag is on. The MUI
 * nav embeds its own (nav-styled) AssistantButton instead.
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
        position: 'fixed',
        // Sit above the 48px unified-chat launcher (bottom: 16px) with an 8px gap.
        bottom: 'calc(16px + 48px + 8px)',
        right: 16,
        zIndex: theme.zIndex.speedDial,
        width: 48,
        height: 48,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: '0 2px 10px 1px rgba(0, 0, 0, 0.2)',
        '&:hover': { backgroundColor: theme.palette.primary.dark },
      })}
    >
      <AutoAwesomeIcon />
    </IconButton>
  );
};
