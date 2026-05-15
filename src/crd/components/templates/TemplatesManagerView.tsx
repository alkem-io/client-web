import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Collapsible, CollapsibleContent } from '@/crd/primitives/collapsible';
import { Input } from '@/crd/primitives/input';
import { Skeleton } from '@/crd/primitives/skeleton';
import { TemplateCard, TYPE_ICON } from './TemplateCard';
import { TemplateSectionHeader } from './TemplateSectionHeader';
import type { TemplateCardData, TemplatesManagerViewProps, TemplateType } from './types';
import { TEMPLATE_TYPE_ORDER } from './types';

function matchesSearch(card: TemplateCardData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    card.name.toLowerCase().includes(q) ||
    card.description.toLowerCase().includes(q) ||
    card.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function TemplatesManagerView({
  categories,
  loading,
  duplicatingId,
  deletingId,
  canCreate,
  canEdit,
  canDelete,
  canImport,
  onCreate,
  onImport,
  onTemplateAction,
  className,
}: TemplatesManagerViewProps) {
  const { t } = useTranslation('crd-templates');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Partial<Record<TemplateType, boolean>>>({});

  const byType = new Map(categories.map(c => [c.type, c.templates] as const));

  const visibleTypes = TEMPLATE_TYPE_ORDER.filter(type => {
    const templates = byType.get(type) ?? [];
    return templates.length > 0 || canCreate(type) || canImport(type);
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <div className="relative">
        <Search aria-hidden="true" className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('manager.search')}
          aria-label={t('manager.search')}
          className="pl-9"
        />
      </div>

      {loading ? (
        <output aria-label={t('preview.loading')} className="block space-y-6">
          {[0, 1].map(i => (
            <div key={i} className="bg-card border rounded-lg p-4 space-y-4">
              <Skeleton className="h-12 w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="aspect-video w-full" />
              </div>
            </div>
          ))}
        </output>
      ) : (
        <ul aria-label={t('manager.sectionList')} className="space-y-6">
          {visibleTypes.map(type => {
            const allTemplates = byType.get(type) ?? [];
            const filtered = allTemplates.filter(card => matchesSearch(card, search));
            const open = !collapsed[type];
            const SectionIcon = TYPE_ICON[type];
            const sectionDuplicating = allTemplates.some(c => c.id === duplicatingId);

            return (
              <li key={type}>
                <Collapsible
                  open={open}
                  onOpenChange={isOpen => setCollapsed(prev => ({ ...prev, [type]: !isOpen }))}
                  className="bg-card border rounded-lg overflow-hidden"
                >
                  <TemplateSectionHeader
                    type={type}
                    count={allTemplates.length}
                    open={open}
                    duplicating={sectionDuplicating}
                    canCreate={canCreate(type)}
                    canImport={canImport(type)}
                    onCreate={() => onCreate(type)}
                    onImport={() => onImport(type)}
                  />
                  <CollapsibleContent>
                    <div className="p-4 border-t">
                      {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                          <SectionIcon aria-hidden="true" className="size-10 mb-3 opacity-20" />
                          <p className="text-body-emphasis">
                            {canCreate(type) || canImport(type)
                              ? t('manager.noTemplates')
                              : t('manager.noTemplatesReadOnly')}
                          </p>
                          {(canCreate(type) || canImport(type)) && (
                            <p className="text-body">{t('manager.noTemplatesHint')}</p>
                          )}
                        </div>
                      ) : (
                        <ul
                          aria-label={t('manager.templateList')}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                          {filtered.map(card => (
                            <li key={card.id}>
                              <TemplateCard
                                template={card}
                                canEdit={canEdit(type)}
                                canDelete={canDelete(type)}
                                deleting={card.id === deletingId}
                                duplicating={card.id === duplicatingId}
                                onPreview={id => onTemplateAction(id, 'preview')}
                                onAction={onTemplateAction}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
