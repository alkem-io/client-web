import { Ban, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { ScrollArea } from '@/crd/primitives/scroll-area';
import { Skeleton } from '@/crd/primitives/skeleton';
import { TYPE_ICON } from './TemplateCard';
import { TemplateContentPreview } from './TemplateContentPreview';
import { TemplatePicker } from './TemplatePicker';
import type { SetDefaultTemplateDialogProps } from './types';

export function SetDefaultTemplateDialog(props: SetDefaultTemplateDialogProps) {
  // -- flow-state default callout template: just the picker (Space/Account/Platform), select-mode --
  if (props.purpose === 'flowStateDefaultCalloutTemplate') {
    return (
      <TemplatePicker
        mode="select"
        open={props.open}
        onClose={props.onClose}
        sources={props.sources}
        search={props.search}
        onSearchChange={props.onSearchChange}
        allowedTypes={['callout']}
        selectedId={props.currentTemplateId}
        onSelect={id => props.onConfirm(id)}
        onPreview={props.onPreview}
        previewContent={props.previewContent}
        previewLoading={props.previewLoading}
      />
    );
  }

  // -- default subspace template: a plain candidate list (the set's own Space templates) + preview --
  return <SubspaceDefaultDialog {...props} />;
}

function SubspaceDefaultDialog({
  open,
  onClose,
  candidates,
  candidatesLoading,
  currentTemplateId,
  onPreview,
  previewContent,
  previewLoading,
  onConfirm,
  confirming,
}: Extract<SetDefaultTemplateDialogProps, { purpose: 'defaultSubspaceTemplate' }>) {
  const { t } = useTranslation('crd-templates');
  const [selectedId, setSelectedId] = useState<string | null>(currentTemplateId ?? null);

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id) onPreview(id);
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('setDefault.subspaceTitle')}</DialogTitle>
          <DialogDescription>{t('setDefault.subspaceSubtitle')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] gap-4 min-h-[20rem]">
          <ScrollArea className="max-h-[55vh] pr-3">
            {candidatesLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-10 text-center text-body text-muted-foreground">{t('setDefault.noCandidates')}</p>
            ) : (
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => select(null)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedId === null && 'ring-2 ring-ring'
                    )}
                    aria-pressed={selectedId === null}
                  >
                    <Ban aria-hidden="true" className="size-5 text-muted-foreground" />
                    <span className="text-control">{t('setDefault.none')}</span>
                  </button>
                </li>
                {candidates.map(card => {
                  const Icon = TYPE_ICON[card.type];
                  const selected = card.id === selectedId;
                  return (
                    <li key={card.id}>
                      <button
                        type="button"
                        onClick={() => select(card.id)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-md border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          selected && 'ring-2 ring-ring'
                        )}
                        aria-pressed={selected}
                      >
                        <span className="size-10 shrink-0 overflow-hidden rounded-md">
                          {card.bannerUrl ? (
                            <img src={card.bannerUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <span
                              className="size-full flex items-center justify-center"
                              style={backgroundGradient(card.color)}
                            >
                              <Icon aria-hidden="true" className="size-5 text-white/70" />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-card-title truncate">{card.name}</span>
                          {card.description && (
                            <span className="block text-caption text-muted-foreground truncate">
                              {card.description}
                            </span>
                          )}
                        </span>
                        {selected && <Check aria-hidden="true" className="size-4 text-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>

          <aside className="border rounded-md p-3 bg-muted/20">
            {selectedId === null ? (
              <p className="text-body text-muted-foreground py-8 text-center">{t('setDefault.none')}</p>
            ) : previewLoading ? (
              <TemplateContentPreview content={{ type: 'post', defaultDescription: '' }} loading={true} />
            ) : previewContent ? (
              <TemplateContentPreview content={previewContent} />
            ) : (
              <p className="text-body text-muted-foreground py-8 text-center">{t('setDefault.previewHint')}</p>
            )}
          </aside>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={confirming}>
            {t('setDefault.cancel')}
          </Button>
          <Button variant="default" onClick={() => onConfirm(selectedId)} disabled={confirming} aria-busy={confirming}>
            {confirming && <Loader2 aria-hidden="true" className="size-4 mr-2 animate-spin" />}
            {selectedId === null ? t('setDefault.clear') : t('setDefault.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
