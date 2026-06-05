import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { IconButton, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssistantContext } from './AssistantContext';
import { useAssistantEnabled } from './useAssistantEnabled';

/**
 * Entry point that opens the AI assistant panel. Rendered in both nav variants
 * (the MUI PlatformNavigationBar and, via a floating connector, the CRD layout).
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
    <Paper
      component={IconButton}
      // Drop any stale whiteboard scope so the global panel always opens as the
      // dialog (its gate requires `panelContext === null`), never suppressed by a
      // board that was closed without collapsing its rail.
      onClick={() => {
        clearPanelContext();
        setIsOpen(true);
      }}
      color="primary"
      aria-label={t('assistant.openButton')}
      sx={{
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          background: theme => theme.palette.background.paper,
          opacity: 0.9,
        },
      }}
    >
      <AutoAwesomeOutlinedIcon />
    </Paper>
  );
};
