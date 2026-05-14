import { useMemo, useState } from 'react';
import { TemplateContentPreview } from '@/crd/components/templates/TemplateContentPreview';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import { TemplatesManagerView } from '@/crd/components/templates/TemplatesManagerView';
import type {
  TemplateAction,
  TemplateContent,
  TemplateType,
} from '@/crd/components/templates/types';
import { Button } from '@/crd/primitives/button';
import {
  MOCK_ALL_TEMPLATES,
  MOCK_TEMPLATE_CATEGORIES,
  MOCK_TEMPLATE_CONTENT_BY_ID,
} from '../data/templates';

/**
 * Standalone preview for the holder-agnostic `TemplatesManagerView` (T088).
 *
 * Renders the manager populated across every type, with a working preview dialog
 * (lazy "fetched" content from `MOCK_TEMPLATE_CONTENT_BY_ID`) and click-to-toggle
 * read-only vs management modes so designers can see both authz states.
 */
export function TemplatesPage() {
  const [holderKind, setHolderKind] = useState<'space' | 'innovationPack'>('space');
  const [readOnly, setReadOnly] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Preview dialog state.
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);

  const previewHeader = useMemo(
    () => (previewId ? MOCK_ALL_TEMPLATES.find(t => t.id === previewId) : undefined),
    [previewId]
  );

  const openPreview = (id: string) => {
    setPreviewId(id);
    setPreviewLoading(true);
    setPreviewContent(undefined);
    // Simulate a lazy fetch so the skeleton flashes.
    window.setTimeout(() => {
      setPreviewContent(MOCK_TEMPLATE_CONTENT_BY_ID[id]);
      setPreviewLoading(false);
    }, 350);
  };

  const closePreview = () => {
    setPreviewId(null);
    setPreviewLoading(false);
    setPreviewContent(undefined);
  };

  const handleAction = (id: string, action: TemplateAction) => {
    if (action === 'preview') {
      openPreview(id);
      return;
    }
    if (action === 'duplicate') {
      setDuplicatingId(id);
      window.setTimeout(() => setDuplicatingId(null), 1200);
      return;
    }
    if (action === 'delete') {
      setDeletingId(id);
      window.setTimeout(() => setDeletingId(null), 1200);
      return;
    }
    // 'edit' would open the form dialog in production; here we just log.
    // biome-ignore lint/suspicious/noConsole: standalone preview app.
    console.log('Template action', action, id);
  };

  const allTypes = (_t: TemplateType) => !readOnly;
  const importAllowed = (_t: TemplateType) => !readOnly && holderKind === 'space';

  return (
    <div className="crd-root mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-page-title">Templates manager</h1>
          <p className="text-body text-muted-foreground">
            Mock preview of <code className="text-caption">TemplatesManagerView</code> with every template type
            populated. Click a card to preview; toggle the holder + read-only knobs below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={holderKind === 'space' ? 'default' : 'outline'}
            onClick={() => setHolderKind('space')}
          >
            Space holder
          </Button>
          <Button
            size="sm"
            variant={holderKind === 'innovationPack' ? 'default' : 'outline'}
            onClick={() => setHolderKind('innovationPack')}
          >
            Pack holder
          </Button>
          <span className="mx-2 h-6 w-px bg-border" aria-hidden="true" />
          <Button size="sm" variant={readOnly ? 'default' : 'outline'} onClick={() => setReadOnly(r => !r)}>
            {readOnly ? 'Read-only ON' : 'Read-only OFF'}
          </Button>
        </div>
      </header>

      <TemplatesManagerView
        holderKind={holderKind}
        categories={MOCK_TEMPLATE_CATEGORIES}
        duplicatingId={duplicatingId}
        deletingId={deletingId}
        canCreate={allTypes}
        canEdit={allTypes}
        canDelete={allTypes}
        canImport={importAllowed}
        onCreate={type => {
          // biome-ignore lint/suspicious/noConsole: standalone preview app.
          console.log('Create template', type);
        }}
        onImport={type => {
          // biome-ignore lint/suspicious/noConsole: standalone preview app.
          console.log('Import template', type);
        }}
        onTemplateAction={handleAction}
      />

      {previewHeader && (
        <TemplatePreviewDialog
          open={previewId !== null}
          onClose={closePreview}
          header={previewHeader}
          content={previewContent}
          contentLoading={previewLoading}
          onEdit={readOnly ? undefined : () => {
            // biome-ignore lint/suspicious/noConsole: standalone preview app.
            console.log('Edit', previewHeader.id);
          }}
        />
      )}

      {/* Inline content-preview gallery — useful for the design team to see every variant at once
          without having to open each card. */}
      <section aria-labelledby="content-gallery" className="space-y-3">
        <h2 id="content-gallery" className="text-section-title">
          All preview variants
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MOCK_ALL_TEMPLATES.map(card => {
            const content = MOCK_TEMPLATE_CONTENT_BY_ID[card.id];
            if (!content) return null;
            return (
              <div key={card.id} className="rounded-md border bg-card p-4">
                <h3 className="text-card-title mb-2">
                  {card.name} <span className="text-caption text-muted-foreground">({card.type})</span>
                </h3>
                <TemplateContentPreview content={content} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
