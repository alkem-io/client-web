import { ArrowDown, Ban, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { ScrollArea } from '@/crd/primitives/scroll-area';
import { Skeleton } from '@/crd/primitives/skeleton';
import { TemplateContentPreview } from './TemplateContentPreview';
import { TemplatePickerCard } from './TemplatePickerCard';
import type { TemplateCardData, TemplatePickerProps, TemplatePickerSource, TemplatePickerSourceKey } from './types';

const SOURCE_ORDER: TemplatePickerSourceKey[] = ['space', 'account', 'platform'];

function matchesSearch(card: TemplateCardData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    card.name.toLowerCase().includes(q) ||
    card.description.toLowerCase().includes(q) ||
    card.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function TemplatePicker(props: TemplatePickerProps) {
  const { t } = useTranslation('crd-templates');
  const {
    open,
    onClose,
    sources,
    search,
    onSearchChange,
    loading,
    onPreview,
    previewId,
    previewContent,
    previewLoading,
  } = props;
  const isImport = props.mode === 'import';
  const title = isImport ? t('picker.importTitle') : t('picker.title');

  const orderedSources: TemplatePickerSource[] = SOURCE_ORDER.map(key => sources.find(s => s.key === key))
    .filter((s): s is TemplatePickerSource => s !== undefined)
    .filter(s => s.templates.length > 0 || Boolean(s.loading));
  const anyTemplates = orderedSources.some(s => s.templates.length > 0);
  const anyLoading = loading || orderedSources.some(s => s.loading);

  const selectedId = props.mode === 'select' ? props.selectedId : undefined;

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      {/* `sm:` prefix is required: DialogContent's own `sm:max-w-lg` beats an unprefixed `max-w-*`
          at ≥sm (tailwind-merge keeps both, the responsive one wins) — same gotcha as TemplateFormDialog.
          `z-[70]` (content + overlay): the picker is opened on top of other dialogs — notably the
          whiteboard editor shell, which is `z-[60]` — so it must out-stack them. */}
      <DialogContent className={cn('z-[70] sm:max-w-6xl', props.className)} overlayClassName="z-[70]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {(anyTemplates || anyLoading) && (
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={t('picker.search')}
              aria-label={t('picker.search')}
              className="pl-9"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] gap-4 min-h-[24rem]">
          {/* Source sections */}
          <ScrollArea className="max-h-[60vh] pr-3">
            {anyLoading && !anyTemplates ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="aspect-video w-full rounded-lg" />
                ))}
              </div>
            ) : !anyTemplates ? (
              <p className="py-12 text-center text-body text-muted-foreground">{t('picker.noTemplates')}</p>
            ) : (
              <div className="space-y-6">
                {orderedSources.map(source => {
                  const filtered = source.templates.filter(card => matchesSearch(card, search));
                  if (filtered.length === 0 && !source.loading) return null;
                  return (
                    <section key={source.key} className="space-y-2">
                      <h3 className="text-label uppercase text-muted-foreground">
                        {t(`picker.sources.${source.key}`)}
                      </h3>
                      {source.loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {[0, 1, 2].map(i => (
                            <Skeleton key={i} className="aspect-video w-full rounded-lg" />
                          ))}
                        </div>
                      ) : (
                        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {filtered.map(card => (
                            <li key={card.id}>
                              {props.mode === 'select' ? (
                                <TemplatePickerCard
                                  mode="select"
                                  template={card}
                                  selected={card.id === selectedId}
                                  onPreview={onPreview}
                                  onSelect={id => props.onSelect(id)}
                                />
                              ) : (
                                <TemplatePickerCard
                                  mode="import"
                                  template={card}
                                  onPreview={onPreview}
                                  alreadyInSet={props.alreadyInSet.has(card.id)}
                                  onImport={id => props.onImport(id)}
                                  onRemove={id => props.onRemoveFromSet(id)}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Preview pane */}
          <aside className="border rounded-md p-3 bg-muted/20 flex flex-col max-h-[60vh]">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {previewLoading ? (
                <TemplateContentPreview content={{ type: 'post', defaultDescription: '' }} loading={true} />
              ) : previewContent ? (
                <TemplateContentPreview content={previewContent} />
              ) : (
                <p className="text-body text-muted-foreground py-8 text-center">{t('picker.selectPreviewHint')}</p>
              )}
            </div>
            {/* "Use this template" / "Import" action for the currently-previewed template. */}
            {previewId && previewContent && !previewLoading && (
              <div className="mt-3 pt-3 border-t">
                {props.mode === 'select' ? (
                  <Button className="w-full" onClick={() => props.onSelect(previewId)}>
                    <ArrowDown aria-hidden="true" className="size-4 mr-1.5" />
                    {t('picker.select')}
                  </Button>
                ) : props.alreadyInSet.has(previewId) ? null : (
                  <Button variant="outline" className="w-full" onClick={() => props.onImport(previewId)}>
                    <Plus aria-hidden="true" className="size-4 mr-1.5" />
                    {t('picker.import')}
                  </Button>
                )}
              </div>
            )}
          </aside>
        </div>

        <DialogFooter className="sm:justify-between">
          {props.mode === 'select' ? (
            <Button variant="ghost" onClick={() => props.onSelect(null)}>
              <Ban aria-hidden="true" className="size-4 mr-2" />
              {t('picker.noTemplate')}
            </Button>
          ) : (
            <span />
          )}
          <Button variant="outline" onClick={onClose}>
            {isImport ? t('picker.done') : t('picker.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
