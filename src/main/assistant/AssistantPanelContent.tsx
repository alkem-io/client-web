import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StopIcon from '@mui/icons-material/Stop';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import { FocusScope } from '@radix-ui/react-focus-scope';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import { useAssistantContext } from './AssistantContext';
import { AssistantConversationView } from './AssistantConversationView';
import AssistantNewConversationButton from './AssistantNewConversationButton';
import AssistantSettingsDialog from './AssistantSettingsDialog';
import { useAssistantConversation } from './useAssistantConversation';
import { useAssistantRehydrate } from './useAssistantRehydrate';

/**
 * The assistant panel body (header + conversation + composer + settings), shared
 * by the two shells that host it: the global MUI dialog (AssistantDialog) and the
 * whiteboard-docked rail (WhiteboardAssistantRailConnector → AssistantRailFrame).
 *
 * It owns the conversation transport hooks (useAssistantConversation /
 * useAssistantRehydrate), so EXACTLY ONE instance may be mounted at a time — the
 * two shells are mutually exclusive on `panelContext` (null → dialog, set → rail).
 * `onClose` is injected so each shell decides what "close" means; the panel-level
 * teardown (abort the in-flight turn + drop the per-turn whiteboard scope) lives
 * here so both shells share it.
 *
 * Default-exported so the CRD whiteboard layer can `React.lazy()` it — that keeps
 * MUI out of the CRD whiteboard route chunk (loaded only when the rail opens).
 */
type AssistantPanelContentProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AssistantPanelContent = ({ isOpen, onClose }: AssistantPanelContentProps) => {
  const { t } = useTranslation();
  const { panelContext, clearPanelContext } = useAssistantContext();
  const { sendMessage, cancel, isStreaming, startNewConversation } = useAssistantConversation();
  const [draft, setDraft] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Rehydrate the single rolling thread on open/reload (incl. a pending
  // confirmation) and reconnect an in-flight turn (US3 / FR-011).
  useAssistantRehydrate();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Excalidraw aggressively reclaims focus when the panel opens over a whiteboard,
  // so MUI's autoFocus alone doesn't stick. Nudge focus to the input once the
  // panel has mounted/animated so the user can type immediately.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  // Abort any in-flight stream if a host unmounts the panel without going through
  // the explicit close control (rail collapsed, board closed, dialog backdrop
  // dismissed). `cancel` reads a stable ref, so the empty-deps capture is safe.
  useEffect(() => () => cancel(), []);

  const handleSend = () => {
    const content = draft;
    setDraft('');
    void sendMessage(content);
  };

  const handleClose = () => {
    cancel();
    // Drop the per-turn whiteboard scope so it never leaks into a later
    // globally-opened panel, then let the host collapse/close its shell.
    clearPanelContext();
    onClose();
  };

  return (
    <FocusScope
      // The whiteboard editor is a Radix-modal dialog whose own FocusScope keeps
      // reclaiming the keyboard for the Excalidraw canvas. A Radix scope only
      // pauses for ANOTHER Radix scope, so trapping here pauses the whiteboard's
      // trap and keeps the input focusable. Stays trapped even while the settings
      // dialog is open — that dialog mounts its OWN FocusScope on top of the stack,
      // so the whiteboard never momentarily reclaims focus during the transition.
      trapped={true}
      loop={true}
      onMountAutoFocus={event => event.preventDefault()}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}
    >
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

      <AssistantSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        scope={panelContext ? 'whiteboard' : 'all'}
      />
    </FocusScope>
  );
};

export default AssistantPanelContent;
