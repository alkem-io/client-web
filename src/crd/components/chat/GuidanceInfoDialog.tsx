import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type GuidanceInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Explains what the Guidance assistant is (beta disclaimer). CRD port of the legacy ChatWidgetHelpDialog. */
export function GuidanceInfoDialog({ open, onOpenChange }: GuidanceInfoDialogProps) {
  const { t } = useTranslation('crd-chat');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info aria-hidden="true" className="size-5" />
            {t('guidance.infoDialog.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('guidance.infoDialog.title')}</DialogDescription>
        </DialogHeader>
        <MarkdownContent content={t('guidance.infoDialog.content')} />
      </DialogContent>
    </Dialog>
  );
}
