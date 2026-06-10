import { useRef, useState } from 'react';
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
import {
  type TemplateMarkdownUploadByIntent,
  type TemplateReferenceUpload,
  type UseTemplateFormsResult,
  useTemplateForms,
} from './useTemplateForms';

const EMPTY_STRING_SET: ReadonlySet<string> = new Set();

export type UseTemplatesManagerArgs = {
  templatesSetId: string | undefined;
  holderKind: 'space' | 'innovationPack';
  /** account id — used only when holderKind === 'space' to populate the import picker's Account source (wired by the page). */
  accountId?: string;
  /** Parent space id — threaded through the Callout template form's `ResponseDefaultsConnector`. */
  spaceId?: string;
  /** Markdown image-upload wiring per intent — forwarded to `useTemplateForms`. */
  markdownUpload?: TemplateMarkdownUploadByIntent;
  /** References paperclip file-upload — forwarded to `useTemplateForms` (CG template form). */
  referenceUpload?: TemplateReferenceUpload;
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
  /** preview / edit / duplicate / delete — all 5 types. */
  onTemplateAction: (id: string, action: TemplateAction) => void;
  preview: TemplatesManagerPreviewState;
  /** The create/edit form-dialog state — the page renders `<TemplateFormDialog {...form} />`. */
  form: UseTemplateFormsResult;
  /** Import-from-library picker (Space holder only) — the page renders `<TemplatePicker {...importPicker} />`. */
  importPicker: TemplatePickerImportProps;
  pendingDelete: { id: string; name: string } | null;
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
  markdownUpload,
  referenceUpload,
}: UseTemplatesManagerArgs): UseTemplatesManagerResult {
  const { data, loading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId: templatesSetId ?? '' },
    skip: !templatesSetId,
  });
  const categories = mapTemplatesSetToCategories(data?.lookup.templatesSet);
  const allCards = categories.flatMap(c => c.templates);
  const findCard = (id: string) => allCards.find(c => c.id === id);

  // ── create/edit form lifecycle ──
  const form = useTemplateForms({ templatesSetId, spaceId, markdownUpload, referenceUpload });
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
        // Guard against a slow response for template A landing after the user has already opened B (or
        // closed the dialog). The previous state's `header.id` is the active preview at commit time.
        setPreview(prev =>
          prev.header?.id === id
            ? {
                ...prev,
                content: fetched ? mapTemplateContent(fetched, card.type) : undefined,
                contentLoading: false,
              }
            : prev
        );
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
    // Captured once and threaded into the form so the edit submit can build
    // `UpdateProfileInput.tagsets: [{ ID: tagsetId, tags }]` (tags don't have a top-level field
    // on the profile-update input).
    const tagsetId = fetched.profile.defaultTagset?.id;
    if (card.type === 'callout') {
      if (!fetched.callout) return;
      form.openEditCallout(
        card.id,
        fetched.callout.id,
        { name: card.name, description: card.description, tags: card.tags },
        calloutTemplateContentToFormValues(fetched.callout),
        tagsetId
      );
      return;
    }
    if (card.type === 'space') {
      // Space template edit is profile-only by default. The captured structure is previewed from the
      // template's own `contentSpace` (a `TemplateContentSpace`, NOT a real `Space`), so we must NOT
      // seed it as `sourceSpaceId` — that id can't be looked up via `SpaceTemplateContent`
      // (`lookup.space`) and would 404. `sourceSpaceId` stays undefined; the URL picker lets the user
      // optionally re-select a real source space to re-capture from on save.
      const preview = mapTemplateContent(fetched, 'space');
      form.openEdit(
        card.id,
        {
          type: 'space',
          name: card.name,
          description: card.description,
          tags: card.tags,
          recursive: true,
          sourceSpaceId: undefined,
        },
        undefined,
        tagsetId,
        undefined,
        preview.type === 'space' ? preview : undefined
      );
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
    // For CG: snapshot the CG entity's profile id + original reference ids so the submit can route
    // adds/removes through `createReferenceOnProfile` / `deleteReference` (the CG update mutation
    // only updates existing references — see `useTemplateForms.submitEdit`).
    const cgContext =
      card.type === 'communityGuidelines' && fetched.communityGuidelines
        ? {
            profileId: fetched.communityGuidelines.profile.id,
            originalReferenceIds: (fetched.communityGuidelines.profile.references ?? []).map(r => r.id),
          }
        : undefined;
    form.openEdit(card.id, formValues, subEntityId, tagsetId, cgContext);
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
  // The server-side `deleteTemplate` mutation cascades referencing defaults (it nulls
  // `TemplateDefault` pointers + clears `innovationFlow.states[*].defaultCalloutTemplate`).
  // The CRD client's only responsibility is to refetch the queries that show template lists
  // or default-template pointers so the UI reflects the cascade without a hard refresh.
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTemplate] = useDeleteTemplateMutation({
    refetchQueries: [
      ...(templatesSetId ? [refetchAllTemplatesInTemplatesSetQuery({ templatesSetId })] : []),
      // Surfaces that show a default-template pointer the server may have just cleared:
      'SpaceAdminDefaultSpaceTemplatesDetails', // Space templatesManager.templateDefaults (default-subspace-template)
      'SpaceContentTemplatesOnSpace', // Subspaces tab's "select default" picker choices
      'SpaceTab', // space.collaboration.innovationFlow.states[*].defaultCalloutTemplate
      'InnovationFlowSettings', // same flow-state field, Layout-tab alternative surface
      'SpaceTemplatesManager', // holder metadata
      // Surfaces that show template lists:
      'InnovationLibrary',
      'ImportTemplateDialogAccountTemplates',
      'ImportTemplateDialogPlatformTemplates',
    ],
    awaitRefetchQueries: true,
    update: (cache, _result, { variables }) => {
      if (!variables?.templateId) return;
      cache.evict({ id: cache.identify({ __typename: 'Template', id: variables.templateId }) });
      cache.gc();
    },
  });
  const requestDelete = (id: string) => {
    const card = findCard(id);
    if (!card) return;
    setPendingDelete({ id, name: card.name });
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const targetId = pendingDelete.id;
    setDeletingId(targetId);
    setPendingDelete(null);
    try {
      await deleteTemplate({ variables: { templateId: targetId } });
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

  // Tracks the latest import-preview request so a slow response for template A doesn't overwrite the
  // content shown for template B if the user clicked another card mid-fetch.
  const activeImportPreviewIdRef = useRef<string | null>(null);
  const onImportPreview = (id: string) => {
    if (importType === null) return;
    activeImportPreviewIdRef.current = id;
    setImportPreviewId(id);
    setImportPreviewContent(undefined);
    setImportPreviewLoading(true);
    void getTemplateContent({ variables: { templateId: id, ...templateContentIncludeVars(importType) } })
      .then(({ data: contentData }) => {
        if (activeImportPreviewIdRef.current !== id) return;
        const fetched = contentData?.lookup.template;
        setImportPreviewContent(fetched ? mapTemplateContent(fetched, importType) : undefined);
      })
      .finally(() => {
        if (activeImportPreviewIdRef.current === id) setImportPreviewLoading(false);
      });
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
    // Route remove-from-set through the manager-level delete-confirmation flow so destructive
    // confirmation (CRD Rule 9) and the post-delete refetch list both kick in. The picker shows
    // source (not destination) templates today, so `findCard(id)` only resolves when a future
    // build populates `alreadyInSet` with destination ids — in that case this lands the user on
    // the same `ConfirmationDialog` they see from the manager kebab → Delete.
    onRemoveFromSet: id => requestDelete(id),
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
