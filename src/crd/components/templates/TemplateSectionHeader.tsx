import { ChevronDown, ChevronRight, LayoutTemplate, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { CollapsibleTrigger } from '@/crd/primitives/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { TYPE_ICON } from './TemplateCard';
import type { TemplateType } from './types';

export type TemplateSectionHeaderProps = {
  type: TemplateType;
  count: number;
  open: boolean;
  duplicating?: boolean;
  canCreate?: boolean;
  canImport?: boolean;
  onCreate: () => void;
  onImport: () => void;
};

export function TemplateSectionHeader({
  type,
  count,
  open,
  duplicating,
  canCreate,
  canImport,
  onCreate,
  onImport,
}: TemplateSectionHeaderProps) {
  const { t } = useTranslation('crd-templates');
  const Icon = TYPE_ICON[type];
  const showAdd = canCreate || canImport;

  return (
    <div className="p-4 flex items-center justify-between gap-2 bg-muted/20">
      <CollapsibleTrigger asChild={true}>
        <button
          type="button"
          className="flex items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <span className="p-2 bg-background border rounded-md">
            <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
          </span>
          <span>
            <span className="flex items-center gap-2">
              <span className="text-subsection-title">{t(`manager.sections.${type}.title`)}</span>
              <Badge variant="secondary" className="text-badge h-5 px-1.5 min-w-[1.5rem] justify-center">
                {count}
              </Badge>
              {duplicating && (
                <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
                  <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                  {t('manager.duplicating')}
                </span>
              )}
            </span>
            <span className="block text-body text-muted-foreground mt-0.5 hidden sm:block">
              {t(`manager.sections.${type}.subtitle`)}
            </span>
          </span>
          {open ? (
            <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground ml-2" />
          ) : (
            <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground ml-2" />
          )}
        </button>
      </CollapsibleTrigger>

      {showAdd && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">{t('manager.addNew')}</span>
              <ChevronDown aria-hidden="true" className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {canCreate && (
              <DropdownMenuItem onClick={onCreate}>
                <Plus aria-hidden="true" className="size-4 mr-2" />
                {t('manager.createNew')}
              </DropdownMenuItem>
            )}
            {canImport && (
              <DropdownMenuItem onClick={onImport}>
                <LayoutTemplate aria-hidden="true" className="size-4 mr-2" />
                {t('manager.selectFromLibrary')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
