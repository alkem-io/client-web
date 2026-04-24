import { useEffect, useState } from 'react';
import {
  useCreateTemplateFromContentSpaceMutation,
  useCreateTemplateMutation,
  useTemplateContentLazyQuery,
  useUpdateTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { TemplateCategory } from '@/crd/components/space/settings/SpaceSettingsTemplatesView';
import type {
  TemplateEditFieldErrors,
  TemplateEditFormValues,
} from '@/crd/components/space/settings/TemplateEditDialog';
import type { TemplatePreviewData } from '@/crd/components/space/settings/TemplatePreviewDialog';
import {
  toCreateTemplateFromSpaceContentMutationVariables,
  toCreateTemplateMutationVariables,
} from '@/domain/templates/components/Forms/common/mappings';

export type UseTemplateActionsResult = {
  // Preview
  previewOpen: boolean;
  previewLoading: boolean;
  previewData: TemplatePreviewData | null;
  onRequestPreview: (templateId: string, category: TemplateCategory) => void;
  onClosePreview: () => void;
  // Edit
  editOpen: boolean;
  editLoading: boolean;
  editSubmitting: boolean;
  editValues: TemplateEditFormValues;
  editErrors: TemplateEditFieldErrors;
  editIsPost: boolean;
  editAdvancedNotice: string;
  onRequestEdit: (templateId: string, category: TemplateCategory) => void;
  onCloseEdit: () => void;
  onEditChange: (patch: Partial<TemplateEditFormValues>) => void;
  onEditSave: () => Promise<void>;
  // Duplicate
  duplicating: boolean;
  /** Which category is currently being duplicated — used to render per-section spinners. */
  duplicatingCategory: TemplateCategory | null;
  onRequestDuplicate: (templateId: string, category: TemplateCategory) => Promise<void>;
  /** Open the preview, then offer to edit (used by preview's Edit button). */
  onSwitchPreviewToEdit: () => void;
  /** Duplicate the template currently shown in the preview dialog. */
  onDuplicateFromPreview: () => Promise<void>;
};

const EMPTY_EDIT: TemplateEditFormValues = {
  displayName: '',
  description: '',
  tags: [],
  postDefaultDescription: '',
};

function categoryToTemplateTypeLocal(category: TemplateCategory): TemplateType {
  switch (category) {
    case 'space':
      return TemplateType.Space;
    case 'collaborationTool':
      return TemplateType.Callout;
    case 'whiteboard':
      return TemplateType.Whiteboard;
    case 'post':
      return TemplateType.Post;
    case 'communityGuidelines':
      return TemplateType.CommunityGuidelines;
  }
}

/**
 * Preview / Edit / Duplicate actions for individual templates. Mirrors the
 * MUI `TemplatesAdmin` flow (fetch content → createTemplate to duplicate,
 * updateTemplate profile to edit) in a CRD-friendly way. Advanced inner
 * content (whiteboard drawings, callout nested content) is intentionally
 * read-only here — the platform admin remains the canonical editor for it.
 */
export function useTemplateActions({
  templatesSetId,
}: {
  templatesSetId: string | undefined;
}): UseTemplateActionsResult {
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | null>(null);
  const [mode, setMode] = useState<'preview' | 'edit' | null>(null);

  const [editValues, setEditValues] = useState<TemplateEditFormValues>(EMPTY_EDIT);
  const [editErrors, setEditErrors] = useState<TemplateEditFieldErrors>({});

  const [getTemplateContent, { data: contentData, loading: contentLoading }] = useTemplateContentLazyQuery();
  const [createTemplate, { loading: creatingSimple }] = useCreateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [createTemplateFromSpaceContent, { loading: creatingFromSpace }] = useCreateTemplateFromContentSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [updateTemplate, { loading: updating }] = useUpdateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet', 'TemplateContent'],
  });
  const creating = creatingSimple || creatingFromSpace;

  const templateType = activeCategory ? categoryToTemplateTypeLocal(activeCategory) : null;
  const fetched = contentData?.lookup.template;

  // Seed edit form with fetched content.
  useEffect(() => {
    if (mode !== 'edit' || !fetched) return;
    setEditValues({
      displayName: fetched.profile.displayName ?? '',
      description: fetched.profile.description ?? '',
      tags: fetched.profile.defaultTagset?.tags ?? [],
      postDefaultDescription: fetched.postDefaultDescription ?? '',
    });
    setEditErrors({});
  }, [mode, fetched]);

  const loadContent = (templateId: string, category: TemplateCategory) => {
    const type = categoryToTemplateTypeLocal(category);
    void getTemplateContent({
      variables: {
        templateId,
        includeCallout: type === TemplateType.Callout,
        includeCommunityGuidelines: type === TemplateType.CommunityGuidelines,
        includeSpace: type === TemplateType.Space,
        includePost: type === TemplateType.Post,
        includeWhiteboard: type === TemplateType.Whiteboard,
      },
    });
  };

  const onRequestPreview = (templateId: string, category: TemplateCategory) => {
    setActiveTemplateId(templateId);
    setActiveCategory(category);
    setMode('preview');
    loadContent(templateId, category);
  };

  const onClosePreview = () => {
    if (mode === 'preview') {
      setMode(null);
      setActiveTemplateId(null);
      setActiveCategory(null);
    }
  };

  const onRequestEdit = (templateId: string, category: TemplateCategory) => {
    setActiveTemplateId(templateId);
    setActiveCategory(category);
    setMode('edit');
    loadContent(templateId, category);
  };

  const onCloseEdit = () => {
    if (mode === 'edit') {
      setMode(null);
      setActiveTemplateId(null);
      setActiveCategory(null);
      setEditValues(EMPTY_EDIT);
      setEditErrors({});
    }
  };

  const onSwitchPreviewToEdit = () => {
    if (mode !== 'preview') return;
    setMode('edit');
  };

  const onEditChange = (patch: Partial<TemplateEditFormValues>) => {
    setEditValues(prev => ({ ...prev, ...patch }));
    setEditErrors(prev => {
      const next = { ...prev };
      for (const k of Object.keys(patch) as (keyof TemplateEditFormValues)[]) {
        delete next[k];
      }
      return next;
    });
  };

  const onEditSave = async () => {
    if (!activeTemplateId) return;
    const trimmedName = editValues.displayName.trim();
    if (trimmedName.length < 3) {
      setEditErrors({ displayName: 'Name must be at least 3 characters' });
      return;
    }
    await updateTemplate({
      variables: {
        templateId: activeTemplateId,
        profile: {
          displayName: trimmedName,
          description: editValues.description,
          tagsets: fetched?.profile.defaultTagset?.id
            ? [{ ID: fetched.profile.defaultTagset.id, tags: editValues.tags }]
            : undefined,
        },
        ...(templateType === TemplateType.Post
          ? { postDefaultDescription: editValues.postDefaultDescription ?? '' }
          : {}),
      },
    });
    onCloseEdit();
  };

  // ───── Duplicate ─────
  const [duplicatingCategory, setDuplicatingCategory] = useState<TemplateCategory | null>(null);

  const duplicateById = async (templateId: string, category: TemplateCategory) => {
    if (!templatesSetId) return;
    const type = categoryToTemplateTypeLocal(category);

    const { data } = await getTemplateContent({
      variables: {
        templateId,
        includeCallout: type === TemplateType.Callout,
        includeCommunityGuidelines: type === TemplateType.CommunityGuidelines,
        includeSpace: type === TemplateType.Space,
        includePost: type === TemplateType.Post,
        includeWhiteboard: type === TemplateType.Whiteboard,
      },
    });
    const source = data?.lookup.template;
    if (!source) return;

    if (type === TemplateType.Space) {
      // Space templates use a dedicated mutation that copies the content-space
      // graph (collaboration, subspaces, …). Mirror MUI's handleImportSpaceTemplate.
      const variables = toCreateTemplateFromSpaceContentMutationVariables(templatesSetId, {
        ...source,
        contentSpaceId: source.contentSpace?.id ?? '',
        profile: {
          ...source.profile,
          displayName: `${source.profile.displayName} (Copy)`,
        },
      });
      await createTemplateFromSpaceContent({ variables });
      return;
    }

    const cloned = {
      ...source,
      profile: {
        ...source.profile,
        displayName: `${source.profile.displayName} (Copy)`,
      },
    };
    const variables = toCreateTemplateMutationVariables(templatesSetId, type, cloned);
    await createTemplate({ variables });
  };

  const onRequestDuplicate = async (templateId: string, category: TemplateCategory) => {
    setDuplicatingCategory(category);
    try {
      await duplicateById(templateId, category);
    } finally {
      setDuplicatingCategory(null);
    }
  };

  const onDuplicateFromPreview = async () => {
    if (!activeTemplateId || !activeCategory) return;
    await duplicateById(activeTemplateId, activeCategory);
    onClosePreview();
  };

  // ───── Preview data derivation ─────
  const previewData: TemplatePreviewData | null = (() => {
    if (mode !== 'preview' || !fetched) return null;
    const bodyMarkdown =
      templateType === TemplateType.Post
        ? (fetched.postDefaultDescription ?? '')
        : templateType === TemplateType.CommunityGuidelines
          ? (fetched.communityGuidelines?.profile.description ?? '')
          : undefined;
    const bodyLabel =
      templateType === TemplateType.Post
        ? 'Default post description'
        : templateType === TemplateType.CommunityGuidelines
          ? 'Guidelines'
          : undefined;
    return {
      id: fetched.id,
      name: fetched.profile.displayName ?? '',
      description: fetched.profile.description ?? '',
      tags: fetched.profile.defaultTagset?.tags ?? [],
      thumbnailUrl: null,
      bodyMarkdown,
      bodyLabel,
    };
  })();

  const editAdvancedNotice = (() => {
    switch (templateType) {
      case TemplateType.Callout:
      case TemplateType.Whiteboard:
      case TemplateType.Space:
        return 'Structural template content (callout inner content, whiteboard drawings, space structure) is not yet editable here — use the platform admin for advanced edits.';
      default:
        return '';
    }
  })();

  return {
    previewOpen: mode === 'preview',
    previewLoading: contentLoading,
    previewData,
    onRequestPreview,
    onClosePreview,
    editOpen: mode === 'edit',
    editLoading: contentLoading && !fetched,
    editSubmitting: updating,
    editValues,
    editErrors,
    editIsPost: templateType === TemplateType.Post,
    editAdvancedNotice,
    onRequestEdit,
    onCloseEdit,
    onEditChange,
    onEditSave,
    duplicating: creating || duplicatingCategory !== null,
    duplicatingCategory,
    onRequestDuplicate,
    onSwitchPreviewToEdit,
    onDuplicateFromPreview,
  };
}
