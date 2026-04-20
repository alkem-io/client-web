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

export type UseTemplatesTabDataResult = {
  categories: TemplateCategorySection[];
  loading: boolean;
  templatesSetId: string | undefined;
  onCreateTemplate: (c: TemplateCategory) => void;
  onImportTemplate: (c: TemplateCategory) => void;
  onTemplateAction: (id: string, action: TemplateAction) => void;
  pendingDelete: { id: string; name: string } | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
};

export function useTemplatesTabData(spaceId: string): UseTemplatesTabDataResult {
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

  const [deleteTemplate] = useDeleteTemplateMutation({
    refetchQueries: templatesSetId ? [refetchAllTemplatesInTemplatesSetQuery({ templatesSetId })] : [],
    awaitRefetchQueries: true,
  });

  const onTemplateAction = (id: string, action: TemplateAction) => {
    if (action === 'delete') {
      const tmpl = categories.flatMap(c => c.templates).find(t => t.id === id);
      setPendingDelete({ id, name: tmpl?.name ?? '' });
    }
    // preview, duplicate, edit: TODO — wire to existing MUI dialogs or CRD replacements
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      void deleteTemplate({ variables: { templateId: pendingDelete.id } });
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const onCreateTemplate = (_c: TemplateCategory) => {
    // TODO: open create template dialog
  };

  const onImportTemplate = (_c: TemplateCategory) => {
    // TODO: open import from library dialog
  };

  return {
    categories,
    loading: managerLoading || templatesLoading,
    templatesSetId,
    onCreateTemplate,
    onImportTemplate,
    onTemplateAction,
    pendingDelete,
    confirmDelete,
    cancelDelete,
  };
}
