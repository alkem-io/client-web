import { useState } from 'react';
import { InnovationLibraryView } from '@/crd/components/innovationLibrary/InnovationLibraryView';
import type { TemplateTypeFilterValue } from '@/crd/components/innovationLibrary/TemplateTypeFilter';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import type { TemplateContent } from '@/crd/components/templates/types';
import {
  MOCK_ALL_TEMPLATES,
  MOCK_INNOVATION_PACKS,
  MOCK_TEMPLATE_CONTENT_BY_ID,
} from '../data/templates';

/**
 * Standalone preview for the `/innovation-library` page (T088).
 *
 * Renders `InnovationLibraryView` with the mock packs + every mock template;
 * the type filter is wired to client-side state and a card click opens the
 * shared `TemplatePreviewDialog` (lazy "fetched" content from mocks).
 */
export function InnovationLibraryPage() {
  const [filter, setFilter] = useState<TemplateTypeFilterValue>('all');

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);

  const previewHeader = previewId ? MOCK_ALL_TEMPLATES.find(t => t.id === previewId) : undefined;

  const openPreview = (id: string) => {
    setPreviewId(id);
    setPreviewLoading(true);
    setPreviewContent(undefined);
    window.setTimeout(() => {
      setPreviewContent(MOCK_TEMPLATE_CONTENT_BY_ID[id]);
      setPreviewLoading(false);
    }, 350);
  };

  const filteredTemplates =
    filter === 'all'
      ? MOCK_ALL_TEMPLATES
      : MOCK_ALL_TEMPLATES.filter(t => filter.includes(t.type));

  return (
    <div className="crd-root mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-page-title">Innovation Library</h1>
        <p className="text-body text-muted-foreground">
          Mock preview of the public <code className="text-caption">InnovationLibraryView</code> with packs + every
          template type. Filter by type to drive the chip state; click a card to preview.
        </p>
      </header>

      <InnovationLibraryView
        packs={MOCK_INNOVATION_PACKS}
        packsLoading={false}
        templates={filteredTemplates}
        templatesLoading={false}
        activeTypeFilter={filter}
        onChangeTypeFilter={setFilter}
        onTemplatePreview={openPreview}
      />

      {previewHeader && (
        <TemplatePreviewDialog
          open={previewId !== null}
          onClose={() => setPreviewId(null)}
          header={previewHeader}
          content={previewContent}
          contentLoading={previewLoading}
        />
      )}
    </div>
  );
}
