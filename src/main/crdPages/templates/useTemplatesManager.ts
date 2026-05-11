import { useState } from 'react';
import {
  refetchAllTemplatesInTemplatesSetQuery,
  useAllTemplatesInTemplatesSetQuery,
  useDeleteTemplateMutation,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  TemplateAction,
  TemplateCardData,
  TemplateCategorySection,
  TemplateContent,
  TemplateType,
} from '@/crd/components/templates/types';
import { mapTemplateContent, templateContentIncludeVars } from './templateContentMapper';
import { mapTemplatesSetToCategories } from './templatesManagerMapper';

export type UseTemplatesManagerArgs = {
  templatesSetId: string | undefined;
  holderKind: 'space' | 'innovationPack';
  /** account id — used only when holderKind === 'space' to populate the import picker's Account source (wired by the page). */
  accountId?: string;
};

export type TemplatesManagerPreviewState = {
  open: boolean;
  header?: TemplateCardData;
  content?: TemplateContent;
  contentLoading: boolean;
  /** Always false here; the consumer overrides from page access for the preview "Edit" affordance. */
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
};

export type UseTemplatesManagerResult = {
  templatesSetId: string | undefined;
  categories: TemplateCategorySection[];
  loading: boolean;
  duplicatingId: string | null;
  deletingId: string | null;
  /** Surfaces the requested type for the page to host the create dialog. (Per-type form lifecycle = `useTemplateForms`, not yet wired — see `specs/098-crd-templates/assumptions.md` F3.) */
  onCreate: (type: TemplateType) => void;
  /** Surfaces the requested type for the page to host the import-from-library picker (Space holder only). */
  onImport: (type: TemplateType) => void;
  /** preview / duplicate / delete now; edit is `TODO(098)` (needs `useTemplateForms`). */
  onTemplateAction: (id: string, action: TemplateAction) => void;
  preview: TemplatesManagerPreviewState;
  pendingDelete: { id: string; name: string; isUsedAsDefault: boolean } | null;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  pendingCreateType: TemplateType | null;
  clearPendingCreateType: () => void;
  pendingImportType: TemplateType | null;
  clearPendingImportType: () => void;
};

/**
 * Holder-agnostic templates manager. Reuses the existing Apollo operations; builds the
 * `TemplatesManagerView`-shaped category list and owns the delete-confirmation / lazy-preview
 * lifecycle. The create/edit/duplicate *form* lifecycle delegates to `useTemplateForms` (not yet
 * wired in this build — see `specs/098-crd-templates/{assumptions,incongruencies}.md`).
 */
export function useTemplatesManager({
  templatesSetId,
  holderKind,
}: UseTemplatesManagerArgs): UseTemplatesManagerResult {
  const { data, loading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId: templatesSetId ?? '' },
    skip: !templatesSetId,
  });
  const categories = mapTemplatesSetToCategories(data?.lookup.templatesSet);
  const allCards = categories.flatMap(c => c.templates);
  const findCard = (id: string) => allCards.find(c => c.id === id);

  // ── preview ──
  const [getTemplateContent] = useTemplateContentLazyQuery();
  const [preview, setPreview] = useState<{
    open: boolean;
    header?: TemplateCardData;
    content?: TemplateContent;
    contentLoading: boolean;
  }>({ open: false, contentLoading: false });
  const openPreview = (id: string) => {
    const card = findCard(id);
    if (!card) return;
    setPreview({ open: true, header: card, content: undefined, contentLoading: true });
    void getTemplateContent({ variables: { templateId: id, ...templateContentIncludeVars(card.type) } }).then(
      ({ data: contentData }) => {
        const fetched = contentData?.lookup.template;
        setPreview(prev => ({
          ...prev,
          content: fetched ? mapTemplateContent(fetched, card.type) : undefined,
          contentLoading: false,
        }));
      }
    );
  };
  const closePreview = () => setPreview(p => ({ ...p, open: false }));

  // ── duplicate (TODO(098): the create-mutation-input mapping comes from `useTemplateForms`) ──
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const duplicate = (_id: string) => {
    // TODO(098): fetch the template content, build the matching create input via `useTemplateForms`'
    // form↔input mapping, fire `useCreateTemplateMutation` / `useCreateTemplateFromContentSpaceMutation`,
    // and toggle `duplicatingId` around the call.
    void setDuplicatingId;
  };

  // ── delete ──
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string; isUsedAsDefault: boolean } | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTemplate] = useDeleteTemplateMutation({
    refetchQueries: templatesSetId ? [refetchAllTemplatesInTemplatesSetQuery({ templatesSetId })] : [],
    awaitRefetchQueries: true,
    update: (cache, _result, { variables }) => {
      if (!variables?.templateId) return;
      cache.evict({ id: cache.identify({ __typename: 'Template', id: variables.templateId }) });
      cache.gc();
    },
  });
  // TODO(098/V3): consult the holder's `templateDefaults` + the innovation-flow-state defaults.
  const isUsedAsDefault = (_id: string): boolean => false;
  const requestDelete = (id: string) => {
    const card = findCard(id);
    if (!card) return;
    setPendingDelete({ id, name: card.name, isUsedAsDefault: isUsedAsDefault(id) });
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const targetId = pendingDelete.id;
    setDeletingId(targetId);
    setPendingDelete(null);
    try {
      await deleteTemplate({ variables: { templateId: targetId } });
      // TODO(098/FR-019): if it was a default, clear the referencing defaults via `useSetDefaultTemplate`
      // (unless the backend cascade handles it — see V3).
    } finally {
      setDeletingId(null);
    }
  };
  const cancelDelete = () => setPendingDelete(null);

  // ── create / import: surface the requested type for the page to host the right dialog ──
  const [pendingCreateType, setPendingCreateType] = useState<TemplateType | null>(null);
  const [pendingImportType, setPendingImportType] = useState<TemplateType | null>(null);

  const onTemplateAction = (id: string, action: TemplateAction) => {
    switch (action) {
      case 'preview':
        openPreview(id);
        return;
      case 'duplicate':
        duplicate(id);
        return;
      case 'delete':
        requestDelete(id);
        return;
      case 'edit':
        // TODO(098): open the per-type TemplateFormDialog (edit mode) via `useTemplateForms`.
        return;
    }
  };

  return {
    templatesSetId,
    categories,
    loading,
    duplicatingId,
    deletingId,
    onCreate: type => setPendingCreateType(type),
    onImport: type => {
      if (holderKind === 'space') setPendingImportType(type);
    },
    onTemplateAction,
    preview: {
      open: preview.open,
      header: preview.header,
      content: preview.content,
      contentLoading: preview.contentLoading,
      canEdit: false,
      onClose: closePreview,
      onEdit: () => {
        // TODO(098): switch from preview to edit for `preview.header.id`.
      },
    },
    pendingDelete,
    confirmDelete,
    cancelDelete,
    pendingCreateType,
    clearPendingCreateType: () => setPendingCreateType(null),
    pendingImportType,
    clearPendingImportType: () => setPendingImportType(null),
  };
}
