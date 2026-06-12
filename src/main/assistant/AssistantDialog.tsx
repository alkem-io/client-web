import { DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useAssistantContext } from './AssistantContext';
import AssistantPanelContent from './AssistantPanelContent';
import { useAssistantEnabled } from './useAssistantEnabled';

/**
 * The GLOBAL AI assistant panel — the nav-launched, centered dialog. Lazily
 * mounted in root.tsx (mirrors the UserMessaging lazy-dialog pattern) and gated
 * by useAssistantEnabled (auth + feature flag).
 *
 * It renders ONLY when the assistant is open with NO whiteboard scope
 * (`panelContext === null`). When the panel is opened scoped to a whiteboard, the
 * docked rail inside the whiteboard editor hosts the SAME AssistantPanelContent
 * instead. Keeping the two shells mutually exclusive on `panelContext` guarantees
 * exactly one panel body (one conversation store) is mounted at a time.
 */
const AssistantDialog = () => {
  const isEnabled = useAssistantEnabled();
  const { isOpen, setIsOpen, panelContext } = useAssistantContext();

  if (!isEnabled) {
    return null;
  }

  const open = isOpen && panelContext === null;

  return (
    <DialogWithGrid
      open={open}
      columns={6}
      fullHeight={true}
      maxWidth={false}
      onClose={() => setIsOpen(false)}
      aria-labelledby="assistant-dialog-title"
      sx={{
        '.MuiDialog-container': { alignItems: 'stretch' },
        '.MuiDialog-paper': { height: '100%' },
      }}
    >
      <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <AssistantPanelContent isOpen={open} onClose={() => setIsOpen(false)} />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default AssistantDialog;
