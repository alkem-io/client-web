import { X } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Dialog, DialogContentRaw, DialogOverlay, DialogPortal } from '@/crd/primitives/dialog';

type WhiteboardEditorShellProps = {
  open: boolean;
  fullscreen?: boolean;
  onClose: () => void;
  title: ReactNode;
  titleExtra?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function WhiteboardEditorShell({
  open,
  fullscreen,
  onClose,
  title,
  titleExtra,
  headerActions,
  children,
  footer,
  className,
}: WhiteboardEditorShellProps) {
  const { t } = useTranslation('crd-whiteboard');
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="z-[60] bg-background/80 backdrop-blur-sm" />
        <DialogContentRaw
          aria-labelledby={titleId}
          onInteractOutside={e => e.preventDefault()}
          onPointerDownOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => {
            e.preventDefault();
            onClose();
          }}
          className={cn(
            'fixed z-[60] bg-background flex flex-col',
            fullscreen
              ? 'inset-0'
              : 'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[95vw] max-h-[90vh] w-full h-[85vh] rounded-lg border shadow-lg',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
            <div id={titleId} className="flex-1 min-w-0 flex items-center gap-2">
              {title}
              {titleExtra}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer p-1"
                aria-label={t('editor.closeWhiteboard')}
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Content: Excalidraw canvas (or any children) */}
          <div className="flex-1 min-h-0 relative">{children}</div>

          {/* Footer */}
          {footer && <div className="shrink-0">{footer}</div>}
        </DialogContentRaw>
      </DialogPortal>
    </Dialog>
  );
}
