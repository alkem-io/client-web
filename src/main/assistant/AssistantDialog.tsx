import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StopIcon from '@mui/icons-material/Stop';
import { Box, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import { useAssistantContext } from './AssistantContext';
import { AssistantConversationView } from './AssistantConversationView';
import AssistantNewConversationButton from './AssistantNewConversationButton';
import AssistantSettingsDialog from './AssistantSettingsDialog';
import { useAssistantConversation } from './useAssistantConversation';
import { useAssistantEnabled } from './useAssistantEnabled';
import { useAssistantRehydrate } from './useAssistantRehydrate';

/**
 * The global AI assistant panel. Lazily mounted in root.tsx (mirrors the
 * UserMessaging lazy-dialog pattern) and gated by useAssistantEnabled (auth +
 * feature flag). v1 shows the single rolling conversation only — no switcher
 * (FR-011).
 */
const AssistantDialog = () => {
  const { t } = useTranslation();
  const isEnabled = useAssistantEnabled();
  const { isOpen, setIsOpen, panelContext, clearPanelContext } = useAssistantContext();
  const { sendMessage, cancel, isStreaming, startNewConversation } = useAssistantConversation();
  const [draft, setDraft] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Rehydrate the single rolling thread on open/reload (incl. a pending
  // confirmation) and reconnect an in-flight turn (US3 / FR-011).
  useAssistantRehydrate();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Excalidraw aggressively reclaims focus when the panel opens over a whiteboard,
  // so MUI's autoFocus alone doesn't stick. Nudge focus to the input once the
  // dialog has mounted/animated so the user can type immediately.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  if (!isEnabled) {
    return null;
  }

  const handleSend = () => {
    const content = draft;
    setDraft('');
    void sendMessage(content);
  };

  const handleClose = () => {
    cancel();
    setIsOpen(false);
    // Drop any per-turn whiteboard scope so it never leaks into a later
    // globally-opened panel.
    clearPanelContext();
  };

  return (
    <DialogWithGrid
      open={isOpen}
      columns={6}
      fullHeight={true}
      maxWidth={false}
      onClose={handleClose}
      aria-labelledby="assistant-dialog-title"
      sx={{
        '.MuiDialog-container': { alignItems: 'stretch' },
        '.MuiDialog-paper': { height: '100%' },
      }}
    >
      <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          padding={gutters(0.5)}
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Box>
            <Typography id="assistant-dialog-title" variant="h6">
              {t('assistant.title')}
            </Typography>
            {panelContext?.displayName && (
              <Typography variant="caption" color="text.secondary">
                {t('assistant.scopedTo', { name: panelContext.displayName })}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => setSettingsOpen(true)} aria-label={t('assistant.settings')}>
              <SettingsOutlinedIcon />
            </IconButton>
            <IconButton onClick={handleClose} aria-label={t('assistant.closeButton')}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <AssistantConversationView />

        <Box
          display="flex"
          alignItems="center"
          gap={gutters(0.5)}
          padding={gutters(0.5)}
          sx={{ borderTop: theme => `1px solid ${theme.palette.divider}` }}
        >
          <AssistantNewConversationButton onClick={() => void startNewConversation()} />
          <TextField
            // Move focus to the input when the panel opens (T031 focus mgmt).
            // MUI's Dialog focus trap restores focus to the trigger on close.
            inputRef={inputRef}
            autoFocus={true}
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('assistant.inputPlaceholder')}
            aria-label={t('assistant.inputPlaceholder')}
            fullWidth={true}
            multiline={true}
            maxRows={6}
            size="small"
          />
          {isStreaming ? (
            <IconButton onClick={cancel} aria-label={t('assistant.stop')} color="primary">
              <StopIcon />
            </IconButton>
          ) : (
            <IconButton onClick={handleSend} aria-label={t('assistant.send')} color="primary" disabled={!draft.trim()}>
              <SendIcon />
            </IconButton>
          )}
        </Box>

        <AssistantSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default AssistantDialog;
