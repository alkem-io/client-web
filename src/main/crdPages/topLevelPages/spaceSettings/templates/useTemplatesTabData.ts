import { useState } from 'react';
import {
  refetchAllTemplatesInTemplatesSetQuery,
  useAllTemplatesInTemplatesSetQuery,
  useDeleteTemplateMutation,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  TemplateAction,
  TemplateCategory,
  TemplateCategorySection,
} from '@/crd/components/space/settings/SpaceSettingsTemplatesView';
import { mapTemplatesToCategories } from './templatesMapper';
import { type UseTemplateActionsResult, useTemplateActions } from './useTemplateActions';
import { type UseTemplateLibraryResult, useTemplateLibrary } from './useTemplateLibrary';

export type UseTemplatesTabDataResult = {
  categories: TemplateCategorySection[];
  loading: boolean;
  templatesSetId: string | undefined;
  onCreateTemplate: (c: TemplateCategory) => void;
  onImportTemplate: (c: TemplateCategory) => void;
  onTemplateAction: (id: string, action: TemplateAction) => void;
  pendingDelete: { id: string; name: string } | null;
  /** Whether a deletion is currently in flight (used to render a spinner + keep UI busy). */
  deleting: boolean;
  /** Id of the template optimistically being deleted so the list can hide it immediately. */
  deletingTemplateId: string | null;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  /** Template library (import-from-library) dialog state + actions. */
  library: UseTemplateLibraryResult;
  /** Preview / Edit / Duplicate dialog states + actions. */
  actions: UseTemplateActionsResult;
};

export function useTemplatesTabData(spaceId: string, accountId: string | undefined): UseTemplatesTabDataResult {
  const { data: managerData, loading: managerLoading } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const templatesSetId = managerData?.lookup.space?.templatesManager?.templatesSet?.id;

  const { data: templatesData, loading: templatesLoading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId: templatesSetId ?? '' },
    skip: !templatesSetId,
  });

  const templatesSet = templatesData?.lookup.templatesSet;

  const categories = mapTemplatesToCategories(
    templatesSet?.calloutTemplates ?? [],
    templatesSet?.postTemplates ?? [],
    templatesSet?.whiteboardTemplates ?? [],
    templatesSet?.communityGuidelinesTemplates ?? [],
    templatesSet?.spaceTemplates ?? []
  );

  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const [deleteTemplate, { loading: deleting }] = useDeleteTemplateMutation({
    refetchQueries: templatesSetId ? [refetchAllTemplatesInTemplatesSetQuery({ templatesSetId })] : [],
    awaitRefetchQueries: true,
    update: (cache, _result, { variables }) => {
      // Optimistically evict the template from the Apollo cache so the list
      // updates as soon as the mutation fires, without waiting for the refetch.
      if (!variables?.templateId) return;
      cache.evict({ id: cache.identify({ __typename: 'Template', id: variables.templateId }) });
      cache.gc();
    },
  });

  const actions = useTemplateActions({ templatesSetId });

  const onTemplateAction = (id: string, action: TemplateAction) => {
    const tmpl = categories.flatMap(c => c.templates).find(t => t.id === id);
    if (!tmpl) return;
    switch (action) {
      case 'delete':
        setPendingDelete({ id, name: tmpl.name });
        return;
      case 'preview':
        actions.onRequestPreview(id, tmpl.category);
        return;
      case 'edit':
        actions.onRequestEdit(id, tmpl.category);
        return;
      case 'duplicate':
        void actions.onRequestDuplicate(id, tmpl.category);
        return;
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const targetId = pendingDelete.id;
    setDeletingTemplateId(targetId);
    // Close the confirmation dialog immediately — the list row shows a
    // per-item spinner while the mutation + refetch complete.
    setPendingDelete(null);
    try {
      await deleteTemplate({ variables: { templateId: targetId } });
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const library = useTemplateLibrary({ spaceId, templatesSetId, accountId });

  const onCreateTemplate = (_c: TemplateCategory) => {
    // TODO: open create template dialog
  };

  const onImportTemplate = (c: TemplateCategory) => {
    library.openForCategory(c);
  };

  return {
    categories,
    loading: managerLoading || templatesLoading,
    templatesSetId,
    onCreateTemplate,
    onImportTemplate,
    onTemplateAction,
    pendingDelete,
    deleting,
    deletingTemplateId,
    confirmDelete,
    cancelDelete,
    library,
    actions,
  };
}
