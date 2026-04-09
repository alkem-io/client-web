import { ChevronRight, Hash, Image, Megaphone, Presentation, Settings, StickyNote, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';

type AddPostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Field props
  title: { value: string; onChange: (v: string) => void; error?: string };
  tags: { value: string; onChange: (v: string) => void };
  // Slots
  framingEditorSlot?: ReactNode;
  settingsSlot?: ReactNode;
  // Attachment buttons
  activeAttachment?: string;
  onAttachmentChange?: (type: string) => void;
  attachmentEditorSlot?: ReactNode;
  // Actions
  onSubmit: () => void;
  onSaveDraft: () => void;
  onFindTemplate?: () => void;
  submitLabel?: string;
  className?: string;
};

export function AddPostModal({
  open,
  onOpenChange,
  title,
  tags,
  framingEditorSlot,
  settingsSlot,
  activeAttachment,
  onAttachmentChange,
  attachmentEditorSlot,
  onSubmit,
  onSaveDraft,
  onFindTemplate,
  submitLabel,
  className,
}: AddPostModalProps) {
  const { t } = useTranslation('crd-space');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const attachmentOptions = [
    {
      id: 'whiteboard',
      label: t('callout.whiteboard'),
      icon: Presentation,
      color: 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/20',
    },
    {
      id: 'memo',
      label: t('callout.memo'),
      icon: StickyNote,
      color: 'text-chart-2 bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/20',
    },
    {
      id: 'cta',
      label: t('callout.link'),
      icon: Megaphone,
      color: 'text-chart-3 bg-chart-3/10 hover:bg-chart-3/20 border-chart-3/20',
    },
    {
      id: 'image',
      label: t('callout.mediaGallery'),
      icon: Image,
      color: 'text-chart-1 bg-chart-1/10 hover:bg-chart-1/20 border-chart-1/20',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-full sm:max-w-5xl p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[90vh]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur-sm z-10">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {submitLabel ?? t('forms.publish')}
          </DialogTitle>
          <DialogClose
            className="rounded-full p-2 hover:bg-muted transition-colors"
            aria-label={t('contribution.close')}
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">{t('forms.descriptionPlaceholder')}</DialogDescription>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('forms.titlePlaceholder')}
              value={title.value}
              onChange={e => title.onChange(e.target.value)}
              className={cn(
                'w-full text-xl md:text-2xl font-semibold border-none px-0 bg-transparent focus:outline-none placeholder:text-muted-foreground/60',
                title.error && 'text-destructive'
              )}
              aria-label={t('forms.titleLabel')}
            />
            {title.error && <p className="text-xs text-destructive">{title.error}</p>}
          </div>

          {/* Framing editor slot (markdown editor, etc.) */}
          {framingEditorSlot}

          {/* Attachment buttons */}
          {onAttachmentChange && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('forms.framingType')}
              </span>
              <div className="flex flex-wrap gap-2">
                {attachmentOptions.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onAttachmentChange(activeAttachment === item.id ? 'none' : item.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      activeAttachment === item.id
                        ? cn(item.color, 'ring-1 ring-offset-1')
                        : 'bg-background border-border text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {attachmentEditorSlot}
            </div>
          )}

          <Separator />

          {/* Collapsible settings */}
          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setSettingsOpen(!settingsOpen)}
              aria-expanded={settingsOpen}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">{t('mobile.settings')}</span>
              </div>
              <ChevronRight
                className={cn('w-4 h-4 text-muted-foreground transition-transform', settingsOpen && 'rotate-90')}
                aria-hidden="true"
              />
            </button>

            {settingsOpen && (
              <div className="space-y-4 pt-2 px-2">
                {/* Tags */}
                <div className="space-y-1.5">
                  <label htmlFor="add-post-tags" className="text-xs text-muted-foreground">
                    {t('forms.tagsLabel')}
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="add-post-tags"
                      type="text"
                      value={tags.value}
                      onChange={e => tags.onChange(e.target.value)}
                      placeholder={t('forms.tagsLabel')}
                      className="w-full pl-8 h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {settingsSlot}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          {onFindTemplate && (
            <Button variant="outline" onClick={onFindTemplate} className="mr-auto">
              {t('forms.findTemplate')}
            </Button>
          )}
          <Button variant="ghost" onClick={onSaveDraft}>
            {t('forms.saveDraft')}
          </Button>
          <Button onClick={onSubmit} className="px-8">
            {submitLabel ?? t('forms.publish')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
