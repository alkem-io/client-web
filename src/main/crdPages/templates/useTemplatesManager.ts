import { useState } from 'react';
import {
  refetchAllTemplatesInTemplatesSetQuery,
  useAllTemplatesInTemplatesSetQuery,
  useCreateTemplateFromContentSpaceMutation,
  useDeleteTemplateMutation,
  useImportTemplateDialogAccountTemplatesQuery,
  useImportTemplateDialogPlatformTemplatesQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  TemplateAction,
  TemplateCardData,
  TemplateCategorySection,
  TemplateContent,
  TemplatePickerImportProps,
  TemplatePickerSource,
  TemplateType,
} from '@/crd/components/templates/types';
import { calloutTemplateContentToFormValues } from './calloutTemplateMapper';
import { mapGqlTemplateType, mapTemplateToCardData, toGqlTemplateType } from './templateCardMapper';
import { mapTemplateContent, templateContentIncludeVars, templateContentToFormValues } from './templateContentMapper';
import { mapTemplatesSetToCategories } from './templatesManagerMapper';
import { type UseTemplateFormsResult, useTemplateForms } from './useTemplateForms';

const EMPTY_STRING_SET: ReadonlySet<string> = new Set();

export type UseTemplatesManagerArgs = {
  templatesSetId: string | undefined;
  holderKind: 'space' | 'innovationPack';
  /** account id — used only when holderKind === 'space' to populate the import picker's Account source (wired by the page). */
  accountId?: string;
  /** Parent space id — threaded through the Callout template form's `ResponseDefaultsConnector`. */
  spaceId?: string;
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
  /** Opens the CRD-native `TemplateFormDialog` (create mode) for a type — see `form`. */
  onCreate: (type: TemplateType) => void;
  /** Surfaces the requested type for the page to host the import-from-library picker (Space holder only). */
  onImport: (type: TemplateType) => void;
  /** preview / duplicate / delete now; edit is `TODO(098)` (needs `useTemplateForms` edit support). */
  onTemplateAction: (id: string, action: TemplateAction) => void;
  preview: TemplatesManagerPreviewState;
  /** The create/edit form-dialog state — the page renders `<TemplateFormDialog {...form} />`. */
  form: UseTemplateFormsResult;
  /** Import-from-library picker (Space holder only) — the page renders `<TemplatePicker {...importPicker} />`. */
  importPicker: TemplatePickerImportProps;
  pendingDelete: { id: string; name: string; isUsedAsDefault: boolean } | null;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
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
  accountId,
  spaceId,
}: UseTemplatesManagerArgs): UseTemplatesManagerResult {
  const { data, loading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId: templatesSetId ?? '' },
    skip: !templatesSetId,
  });
  const categories = mapTemplatesSetToCategories(data?.lookup.templatesSet);
  const allCards = categories.flatMap(c => c.templates);
  const findCard = (id: string) => allCards.find(c => c.id === id);

  // ── create/edit form lifecycle ──
  const form = useTemplateForms({ templatesSetId, spaceId });
  const [getTemplateContent] = useTemplateContentLazyQuery();
  const [createTemplateFromContentSpace] = useCreateTemplateFromContentSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });

  /** Create a copy of an existing template (used by Duplicate and import-from-library). */
  const createTemplateCopy = async (card: TemplateCardData) => {
    if (!templatesSetId) return;
    const { data: contentData } = await getTemplateContent({
      variables: { templateId: card.id, ...templateContentIncludeVars(card.type) },
    });
    const fetched = contentData?.lookup.template;
    if (!fetched) return;
    if (card.type === 'callout') {
      if (!fetched.callout) return;
      await form.submitCalloutCopy(
        { name: card.name, description: card.description, tags: card.tags },
        calloutTemplateContentToFormValues(fetched.callout)
      );
      return;
    }
    if (card.type === 'space') {
      const contentSpaceId = fetched.contentSpace?.id;
      if (!contentSpaceId) return;
      await createTemplateFromContentSpace({
        variables: {
          templatesSetId,
          contentSpaceId,
          profileData: { displayName: card.name, description: card.description || undefined },
          tags: card.tags.length > 0 ? card.tags : undefined,
        },
      });
      return;
    }
    const formValues = templateContentToFormValues(
      mapTemplateContent(fetched, card.type),
      card.name,
      card.description,
      card.tags
    );
    if (!formValues) return; // (space + callout are handled above)
    await form.submitValues(formValues);
  };

  // ── preview ──
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

  // ── edit (all five types) ──
  const isEditable = (_type: TemplateType) => true;
  const openEditFromCard = async (card: TemplateCardData) => {
    const { data: contentData } = await getTemplateContent({
      variables: { templateId: card.id, ...templateContentIncludeVars(card.type) },
    });
    const fetched = contentData?.lookup.template;
    if (!fetched) return;
    if (card.type === 'callout') {
      if (!fetched.callout) return;
      form.openEditCallout(
        card.id,
        fetched.callout.id,
        { name: card.name, description: card.description, tags: card.tags },
        calloutTemplateContentToFormValues(fetched.callout)
      );
      return;
    }
    if (card.type === 'space') {
      // Space template edit (profile-only — the source space is shown but re-capture isn't wired here).
      form.openEdit(card.id, {
        type: 'space',
        name: card.name,
        description: card.description,
        tags: card.tags,
        recursive: true,
        sourceSpaceId: fetched.contentSpace?.id,
      });
      return;
    }
    const formValues = templateContentToFormValues(
      mapTemplateContent(fetched, card.type),
      card.name,
      card.description,
      card.tags
    );
    if (!formValues) return;
    const subEntityId = card.type === 'communityGuidelines' ? fetched.communityGuidelines?.id : undefined;
    form.openEdit(card.id, formValues, subEntityId);
  };
  const requestEdit = async (id: string) => {
    const card = findCard(id);
    if (card) await openEditFromCard(card);
  };
  const editFromPreview = () => {
    const card = preview.header;
    if (!card || !isEditable(card.type)) return;
    closePreview();
    void openEditFromCard(card);
  };

  // ── duplicate (all five types via `createTemplateCopy`) ──
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const duplicate = async (id: string) => {
    const card = findCard(id);
    if (!card) return;
    setDuplicatingId(id);
    try {
      // Space → create-from-content-space; Callout → create-callout-template; Post/CG/Whiteboard → create-a-copy from form values.
      await createTemplateCopy(card);
    } catch {
      // surfaced by the Apollo error link / global handler
    } finally {
      setDuplicatingId(null);
    }
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

  // ── import-from-library picker (Space holder only) ──
  const isSpaceHolder = holderKind === 'space';
  const [importType, setImportType] = useState<TemplateType | null>(null);
  const [importSearch, setImportSearch] = useState('');
  const [importPreviewId, setImportPreviewId] = useState<string | null>(null);
  const [importPreviewContent, setImportPreviewContent] = useState<TemplateContent | undefined>(undefined);
  const [importPreviewLoading, setImportPreviewLoading] = useState(false);
  const importOpen = importType !== null;

  const { data: importAccountData, loading: importAccountLoading } = useImportTemplateDialogAccountTemplatesQuery({
    variables: { accountId: accountId ?? '', includeCallout: false, includeSpace: false },
    skip: !isSpaceHolder || !accountId || !importOpen,
  });
  const { data: importPlatformData, loading: importPlatformLoading } = useImportTemplateDialogPlatformTemplatesQuery({
    variables: {
      templateTypes: importType ? [toGqlTemplateType(importType)] : [],
      includeCallout: false,
      includeSpace: false,
    },
    skip: !isSpaceHolder || !importOpen,
  });

  const matchesImportType = (gqlType: unknown) =>
    importType !== null && mapGqlTemplateType(gqlType as never) === importType;
  const importAccountCards: TemplateCardData[] = (importAccountData?.lookup.account?.innovationPacks ?? []).flatMap(
    pack =>
      (pack.templatesSet?.templates ?? [])
        .filter(tpl => matchesImportType(tpl.type))
        .map(tpl => mapTemplateToCardData(tpl, pack.profile.displayName))
  );
  const importPlatformCards: TemplateCardData[] = (importPlatformData?.platform.library.templates ?? [])
    .filter(r => matchesImportType(r.template.type))
    .map(r =>
      mapTemplateToCardData(
        r.template,
        r.innovationPack.provider.profile?.displayName ?? r.innovationPack.profile.displayName
      )
    );
  const importSources: TemplatePickerSource[] = [
    { key: 'account', templates: importAccountCards, loading: importAccountLoading },
    { key: 'platform', templates: importPlatformCards, loading: importPlatformLoading },
  ];
  const findImportCard = (id: string) => [...importAccountCards, ...importPlatformCards].find(c => c.id === id);

  const onImportPreview = (id: string) => {
    if (importType === null) return;
    setImportPreviewId(id);
    setImportPreviewContent(undefined);
    setImportPreviewLoading(true);
    void getTemplateContent({ variables: { templateId: id, ...templateContentIncludeVars(importType) } })
      .then(({ data: contentData }) => {
        const fetched = contentData?.lookup.template;
        setImportPreviewContent(fetched ? mapTemplateContent(fetched, importType) : undefined);
      })
      .finally(() => setImportPreviewLoading(false));
  };

  const handleImport = async (id: string) => {
    const card = findImportCard(id);
    if (card) await createTemplateCopy(card);
  };

  const closeImport = () => {
    setImportType(null);
    setImportSearch('');
    setImportPreviewId(null);
    setImportPreviewContent(undefined);
  };

  const importPicker: TemplatePickerImportProps = {
    mode: 'import',
    open: importOpen,
    onClose: closeImport,
    sources: importSources,
    search: importSearch,
    onSearchChange: setImportSearch,
    loading: importAccountLoading && importPlatformLoading,
    onPreview: onImportPreview,
    previewContent: importPreviewId ? importPreviewContent : undefined,
    previewLoading: importPreviewLoading,
    alreadyInSet: EMPTY_STRING_SET,
    onImport: id => void handleImport(id),
    // TODO(098): remove-from-set within the picker (the picker shows source — not destination — templates).
    onRemoveFromSet: () => {},
  };

  const onTemplateAction = (id: string, action: TemplateAction) => {
    switch (action) {
      case 'preview':
        openPreview(id);
        return;
      case 'duplicate':
        void duplicate(id);
        return;
      case 'delete':
        requestDelete(id);
        return;
      case 'edit':
        void requestEdit(id);
        return;
    }
  };

  return {
    templatesSetId,
    categories,
    loading,
    duplicatingId,
    deletingId,
    onCreate: form.openCreate,
    onImport: type => {
      if (!isSpaceHolder) return;
      setImportSearch('');
      setImportPreviewId(null);
      setImportPreviewContent(undefined);
      setImportType(type);
    },
    onTemplateAction,
    preview: {
      open: preview.open,
      header: preview.header,
      content: preview.content,
      contentLoading: preview.contentLoading,
      canEdit: preview.header ? isEditable(preview.header.type) : false,
      onClose: closePreview,
      onEdit: editFromPreview,
    },
    form,
    importPicker,
    pendingDelete,
    confirmDelete,
    cancelDelete,
  };
}
