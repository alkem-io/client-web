import { useState } from 'react';
import { useInnovationLibraryQuery, useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import type { TemplateTypeFilterValue } from '@/crd/components/innovationLibrary/TemplateTypeFilter';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type { TemplateCardData, TemplateContent } from '@/crd/components/templates/types';
import { mapTemplateToCardData } from '@/main/crdPages/templates/templateCardMapper';
import { mapTemplateContent, templateContentIncludeVars } from '@/main/crdPages/templates/templateContentMapper';
import { mapPackToInnovationPackCardData } from './innovationLibraryMapper';

export type UseInnovationLibraryResult = {
  loading: boolean;
  packs: InnovationPackCardData[];
  templates: TemplateCardData[];
  activeTypeFilter: TemplateTypeFilterValue;
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void;
  onTemplatePreview: (templateId: string) => void;
  previewTemplate: TemplateCardData | undefined;
  previewContent: TemplateContent | undefined;
  previewLoading: boolean;
  closePreview: () => void;
};

/**
 * `/innovation-library` page data. Single `useInnovationLibraryQuery` fetch + client-side type filter
 * (mirrors the legacy `InnovationLibraryPage` — no per-filter refetch). Selecting a card lazily fetches
 * the matching template content for the preview dialog the page mounts.
 */
export function useInnovationLibrary(): UseInnovationLibraryResult {
  const { data, loading } = useInnovationLibraryQuery();
  const [filter, setFilter] = useState<TemplateTypeFilterValue>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateCardData | undefined>(undefined);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [getTemplateContent] = useTemplateContentLazyQuery();

  const allTemplates: TemplateCardData[] = (data?.platform.library.templates ?? []).map(row => {
    const providerName = row.innovationPack.provider?.profile?.displayName;
    const packName = row.innovationPack.profile.displayName;
    return mapTemplateToCardData(row.template, providerName ?? packName);
  });
  const filtered = filter === 'all' ? allTemplates : allTemplates.filter(t => filter.includes(t.type));
  const packs: InnovationPackCardData[] = (data?.platform.library.innovationPacks ?? []).map(
    mapPackToInnovationPackCardData
  );

  const onTemplatePreview = (templateId: string) => {
    const card = allTemplates.find(t => t.id === templateId);
    if (!card) return;
    setPreviewTemplate(card);
    setPreviewContent(undefined);
    setPreviewLoading(true);
    void getTemplateContent({
      variables: { templateId, ...templateContentIncludeVars(card.type) },
    })
      .then(({ data: tData }) => {
        const fetched = tData?.lookup.template;
        if (fetched) {
          setPreviewContent(mapTemplateContent(fetched, card.type));
        }
      })
      .catch(() => {
        // Network / auth error — close the preview so the user can retry, rather than leaving the
        // dialog open with no content and no signal of what went wrong.
        setPreviewTemplate(undefined);
      })
      .finally(() => setPreviewLoading(false));
  };

  const closePreview = () => {
    setPreviewTemplate(undefined);
    setPreviewContent(undefined);
  };

  return {
    loading,
    packs,
    templates: filtered,
    activeTypeFilter: filter,
    onChangeTypeFilter: setFilter,
    onTemplatePreview,
    previewTemplate,
    previewContent,
    previewLoading,
    closePreview,
  };
}
