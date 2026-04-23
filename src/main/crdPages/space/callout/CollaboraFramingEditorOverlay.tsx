import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';

type CollaboraFramingEditorOverlayProps = {
  open: boolean;
  collaboraDocumentId: string;
  title: string;
  onClose: () => void;
};

/**
 * Fullscreen Collabora editor dialog rendered as a sibling of CalloutDetailDialog
 * to keep each Radix Dialog's FocusScope independent. Mirrors the CrdMemoDialog
 * sibling pattern used for memo framing.
 */
export function CollaboraFramingEditorOverlay({
  open,
  collaboraDocumentId,
  title,
  onClose,
}: CollaboraFramingEditorOverlayProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col bg-background"
          aria-describedby="collabora-editor-dialog-description"
        >
          <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background">
            <DialogTitle className="text-subsection-title text-foreground truncate">{title}</DialogTitle>
            <DialogDescription id="collabora-editor-dialog-description" className="sr-only">
              {t('callout.openDocument')}
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('contribution.close')}>
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {open && <CollaboraDocumentEditor collaboraDocumentId={collaboraDocumentId} />}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
