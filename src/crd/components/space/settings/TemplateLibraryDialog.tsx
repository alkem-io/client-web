import { ImageIcon, Library, Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';

export type TemplateLibraryItem = {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  /** Optional "provided by" label for platform/account sections (e.g. innovation pack name). */
  providerName?: string | null;
  /** Optional provider avatar. */
  providerAvatarUrl?: string | null;
};

export type TemplateLibrarySection = {
  key: string;
  heading: string;
  templates: TemplateLibraryItem[];
  loading?: boolean;
};

export type TemplateLibraryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Human-readable label for the template type being imported (e.g. "Post", "Whiteboard"). */
  templateTypeLabel?: string;
  /** Renderable sections — in render order. Each section can be empty (shows placeholder). */
  sections: TemplateLibrarySection[];
  /** If true, a "Load platform library" CTA is rendered between space and platform sections. */
  canLoadPlatform: boolean;
  platformLoaded: boolean;
  onLoadPlatform: () => void;
  /** Fired when a template is picked. Dialog stays open while `loadingSelect` is true. */
  onSelect: (template: TemplateLibraryItem) => void;
  loadingSelect?: boolean;
  /** Optional subtitle under the title. */
  subtitle?: string;
};

export function TemplateLibraryDialog({
  open,
  onOpenChange,
  templateTypeLabel,
  sections,
  canLoadPlatform,
  platformLoaded,
  onLoadPlatform,
  onSelect,
  loadingSelect,
  subtitle,
}: TemplateLibraryDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const title = templateTypeLabel
    ? t('templateLibrary.titleForType', { type: templateTypeLabel })
    : t('templateLibrary.title');

  const handleOpenChange = (next: boolean) => {
    if (!next && loadingSelect) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 gap-0 overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <Library aria-hidden="true" className="size-5 text-primary" />
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
        </DialogHeader>

        <Separator />

        <div className="max-h-[65vh] overflow-y-auto p-6 flex flex-col gap-6">
          {sections.map((section, idx) => (
            <LibrarySection
              key={section.key}
              section={section}
              onSelect={onSelect}
              loadingSelect={!!loadingSelect}
              showSeparatorBefore={idx > 0}
            />
          ))}

          {canLoadPlatform && !platformLoaded && (
            <button
              type="button"
              onClick={onLoadPlatform}
              className="inline-flex items-center gap-2 self-start text-sm text-primary hover:underline cursor-pointer"
            >
              <Search aria-hidden="true" className="size-4" />
              {t('templateLibrary.loadPlatform')}
            </button>
          )}
        </div>

        <Separator />

        <DialogFooter className="p-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loadingSelect}>
            {t('templateLibrary.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LibrarySection({
  section,
  onSelect,
  loadingSelect,
  showSeparatorBefore,
}: {
  section: TemplateLibrarySection;
  onSelect: (template: TemplateLibraryItem) => void;
  loadingSelect: boolean;
  showSeparatorBefore: boolean;
}) {
  const { t } = useTranslation('crd-spaceSettings');
  const hasTemplates = section.templates.length > 0;
  const showLoading = !!section.loading && !hasTemplates;
  // Only render the section at all if it has content or is loading — matches MUI.
  if (!hasTemplates && !showLoading) return null;

  return (
    <div className="flex flex-col gap-3">
      {showSeparatorBefore && <Separator />}
      <div className="flex items-center gap-2">
        <h3 className="text-label uppercase text-muted-foreground">{section.heading}</h3>
        {section.loading && <Loader2 aria-hidden="true" className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      {hasTemplates ? (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {section.templates.map(template => (
            <LibraryCard
              key={template.id}
              template={template}
              onSelect={() => onSelect(template)}
              disabled={loadingSelect}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">{t('templateLibrary.emptySection')}</p>
      )}
    </div>
  );
}

function LibraryCard({
  template,
  onSelect,
  disabled,
}: {
  template: TemplateLibraryItem;
  onSelect: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation('crd-spaceSettings');
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all',
        'hover:shadow-md hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={t('templateLibrary.selectAria', { name: template.name })}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon aria-hidden="true" className="size-8 opacity-50" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="font-semibold text-sm leading-tight line-clamp-1">{template.name}</p>
        {template.description && <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>}
        {template.providerName && (
          <div className="mt-1 flex items-center gap-1.5">
            {template.providerAvatarUrl ? (
              <img src={template.providerAvatarUrl} alt="" className="size-3.5 rounded-full object-cover" />
            ) : null}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {template.providerName}
            </Badge>
          </div>
        )}
      </div>
    </button>
  );
}
