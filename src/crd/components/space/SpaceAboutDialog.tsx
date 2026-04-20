import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type SpaceAboutData, SpaceAboutView } from '@/crd/components/space/SpaceAboutView';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';

type SpaceAboutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SpaceAboutData;

  joinSlot?: ReactNode;
  guidelinesSlot?: ReactNode;
  contactHostSlot?: ReactNode;
  lockTooltipSlot?: ReactNode;

  whyTitle?: string;
  whoTitle?: string;

  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;

  className?: string;
};

export function SpaceAboutDialog({
  open,
  onOpenChange,
  data,
  joinSlot,
  guidelinesSlot,
  contactHostSlot,
  lockTooltipSlot,
  whyTitle,
  whoTitle,
  hasEditPrivilege,
  onEditDescription,
  onEditWhy,
  onEditWho,
  onEditReferences,
}: SpaceAboutDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-4xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl rounded-xl"
        aria-describedby="space-about-dialog-description"
      >
        {/* Sticky header */}
        <div className="shrink-0 bg-background flex items-start justify-between gap-3 px-6 py-4 border-b border-border z-20">
          <div className="flex items-start gap-2 min-w-0">
            {lockTooltipSlot && <div className="mt-1 shrink-0">{lockTooltipSlot}</div>}
            <div className="min-w-0">
              <DialogTitle className="leading-tight text-foreground truncate">{data.name}</DialogTitle>
              {data.tagline && (
                <DialogDescription id="space-about-dialog-description" className="text-caption truncate">
                  {data.tagline}
                </DialogDescription>
              )}
              {!data.tagline && (
                <DialogDescription id="space-about-dialog-description" className="sr-only">
                  {t('about.title')}
                </DialogDescription>
              )}
            </div>
          </div>

          <DialogClose asChild={true}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full shrink-0"
              aria-label={t('about.close')}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto bg-background">
          <SpaceAboutView
            data={data}
            className="px-6 py-6"
            joinSlot={joinSlot}
            guidelinesSlot={guidelinesSlot}
            contactHostSlot={contactHostSlot}
            whyTitle={whyTitle}
            whoTitle={whoTitle}
            hasEditPrivilege={hasEditPrivilege}
            onEditDescription={onEditDescription}
            onEditWhy={onEditWhy}
            onEditWho={onEditWho}
            onEditReferences={onEditReferences}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
