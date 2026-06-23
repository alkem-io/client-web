import { useTranslation } from 'react-i18next';
import { Dialog, DialogContentRaw, DialogOverlay, DialogPortal, DialogTitle } from '@/crd/primitives/dialog';
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
  const { t } = useTranslation();
  const isEnabled = useAssistantEnabled();
  const { isOpen, setIsOpen, panelContext } = useAssistantContext();

  if (!isEnabled) {
    return null;
  }

  const open = isOpen && panelContext === null;

  return (
    <Dialog open={open} onOpenChange={next => setIsOpen(next)}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContentRaw
          aria-labelledby="assistant-dialog-title"
          // The panel renders its own header (with title + close); the title is
          // labelled via `assistant-dialog-title`, so keep the Radix-required
          // DialogTitle visually hidden to satisfy the a11y contract.
          className="bg-background fixed top-[50%] left-[50%] z-50 flex h-full max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:max-w-2xl"
        >
          <DialogTitle className="sr-only">{t('assistant.title')}</DialogTitle>
          <AssistantPanelContent isOpen={open} onClose={() => setIsOpen(false)} />
        </DialogContentRaw>
      </DialogPortal>
    </Dialog>
  );
};

export default AssistantDialog;
