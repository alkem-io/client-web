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
  const [packsSearch, setPacksSearch] = useState('');
  const [templatesSearch, setTemplatesSearch] = useState('');

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

  const templatesTerm = templatesSearch.trim().toLowerCase();
  const filteredTemplates = MOCK_ALL_TEMPLATES.filter(t => filter === 'all' || filter.includes(t.type)).filter(
    t => templatesTerm === '' || t.name.toLowerCase().includes(templatesTerm)
  );

  const packsTerm = packsSearch.trim().toLowerCase();
  const filteredPacks = MOCK_INNOVATION_PACKS.filter(p => packsTerm === '' || p.name.toLowerCase().includes(packsTerm));

  return (
    <div className="crd-root mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-page-title">Innovation Library</h1>
        <p className="text-body text-muted-foreground">
          Mock preview of the public <code className="text-caption">InnovationLibraryView</code> with packs + every
          template type. Use the type combobox beside the Templates heading to filter; click a card to preview.
        </p>
      </header>

      <InnovationLibraryView
        packs={filteredPacks}
        packsLoading={false}
        packsTotal={filteredPacks.length}
        hasMorePacks={false}
        loadingMorePacks={false}
        onLoadMorePacks={() => undefined}
        packsSearch={packsSearch}
        onChangePacksSearch={setPacksSearch}
        templates={filteredTemplates}
        templatesLoading={false}
        templatesTotal={filteredTemplates.length}
        hasMoreTemplates={false}
        loadingMoreTemplates={false}
        onLoadMoreTemplates={() => undefined}
        activeTypeFilter={filter}
        onChangeTypeFilter={setFilter}
        templatesSearch={templatesSearch}
        onChangeTemplatesSearch={setTemplatesSearch}
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
