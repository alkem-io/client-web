import { useEffect, useState } from 'react';
import {
  useDeleteSpaceSettingsSubspaceMutation,
  usePinSpaceSettingsSubspaceMutation,
  useReorderSpaceSettingsSubspacesMutation,
  useSetSpaceSettingsSubspaceDefaultTemplateMutation,
  useSpaceSettingsSubspaceTemplatesQuery,
  useUpdateSpaceSettingsSubspacesSortModeMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import type { SubspaceKebabAction, SubspaceTile } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import { useNativeSubspaces } from '@/domain/space/hooks/useNativeSubspaces';
import { useSubspaceDefaultTemplate } from '@/main/crdPages/templates/spaceTemplates/useSubspaceDefaultTemplate';
import {
  mapSortMode,
  mapSortModeToBackend,
  mapSubspaceToTile,
} from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/subspacesMapper';

export type UseSubspacesTabDataResult = {
  subspaces: SubspaceTile[];
  loading: boolean;
  /** 'alphabetical' | 'manual' — drives the sort-mode selector + drag-enabled rule. */
  sortMode: 'alphabetical' | 'manual';
  onSortModeChange: (mode: 'alphabetical' | 'manual') => void;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  onReorder: (subspaceIds: string[]) => void;
  onChangeDefaultTemplate: () => void;
  pendingDelete: { id: string; name: string } | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
  saveAsTemplateSubspaceId: string | null;
  closeSaveAsTemplate: () => void;
  selectDefaultTemplateOpen: boolean;
  openSelectDefaultTemplate: () => void;
  closeSelectDefaultTemplate: () => void;
  onSelectDefaultTemplate: (templateId: string) => void;
  defaultTemplateId: string | undefined;
  /** Subspace-level (Space) templates available in this space's library. */
  subspaceTemplateChoices: { id: string; name: string }[];
  subspaceTemplatesLoading: boolean;
  subspaceTemplatesSaving: boolean;
};

/** Every view of the parent's subspace list re-reads through NativeSubspaces (023 FR-020). */
const SUBSPACE_LIST = ['NativeSubspaces'];

/**
 * Settings → Subspaces tab (map/dispositions/space-screens.tsv, /:spaceNameId/settings/subspaces): the list is
 * NativeSubspaces — `spaces(filter{parent, kind: SPACE})`, ordered by the server in the parent's `sort_mode` — read to
 * its end so a manual reorder sends every child; pin, reorder, delete and the sort-mode write each re-read it.
 */
export function useSubspacesTabData(spaceId: string): UseSubspacesTabDataResult {
  const handleError = useApolloErrorHandler();
  const list = useNativeSubspaces(spaceId || undefined, !spaceId);
  const { hasMore, loading: listLoading, loadMore } = list;
  useEffect(() => {
    if (hasMore && !listLoading) void loadMore();
  }, [hasMore, listLoading, loadMore]);

  const subspaces = (list.subspaces ?? []).map(mapSubspaceToTile);
  const sortMode = mapSortMode(list.space?.settings);

  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [saveAsTemplateSubspaceId, setSaveAsTemplateSubspaceId] = useState<string | null>(null);
  const [selectDefaultTemplateOpen, setSelectDefaultTemplateOpen] = useState(false);

  // templates-screens "subspace default template": the scope's subspace_default binding and its SPACE templates.
  const defaultTemplate = useSubspaceDefaultTemplate(spaceId || undefined, !spaceId);
  const { data: templatesData, loading: loadingSubspaceTemplates } = useSpaceSettingsSubspaceTemplatesQuery({
    variables: { space: spaceId },
    skip: !spaceId || !selectDefaultTemplateOpen,
  });
  const subspaceTemplateChoices =
    templatesData?.templates.map(template => ({ id: template.id, name: template.about.displayName })) ?? [];

  const [deleteSpace] = useDeleteSpaceSettingsSubspaceMutation({
    refetchQueries: SUBSPACE_LIST,
    awaitRefetchQueries: true,
    onError: handleError,
  });
  const [pinSubspace] = usePinSpaceSettingsSubspaceMutation({
    refetchQueries: SUBSPACE_LIST,
    awaitRefetchQueries: true,
    onError: handleError,
  });
  const [reorderSubspaces] = useReorderSpaceSettingsSubspacesMutation({
    refetchQueries: SUBSPACE_LIST,
    onError: handleError,
  });
  const [updateSortMode] = useUpdateSpaceSettingsSubspacesSortModeMutation({
    refetchQueries: SUBSPACE_LIST,
    awaitRefetchQueries: true,
    onError: handleError,
  });
  const [setTemplateDefault, { loading: updatingTemplateDefault }] = useSetSpaceSettingsSubspaceDefaultTemplateMutation(
    {
      refetchQueries: ['CreateSubspaceTemplateDefault'],
      awaitRefetchQueries: true,
      onError: handleError,
    }
  );

  const onKebabAction = (id: string, action: SubspaceKebabAction) => {
    const subspace = subspaces.find(s => s.id === id);
    if (action === 'delete') {
      setPendingDelete({ id, name: subspace?.name ?? '' });
    } else if (action === 'pinToggle') {
      void pinSubspace({ variables: { id, pinned: !(subspace?.isPinned ?? false) } });
    } else if (action === 'saveAsTemplate') {
      setSaveAsTemplateSubspaceId(id);
    }
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      void deleteSpace({ variables: { id: pendingDelete.id } });
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const onReorder = (subspaceIds: string[]) => {
    void reorderSubspaces({ variables: { parent: spaceId, ids: subspaceIds } });
  };

  // "settings tab write (… sortMode-only write from subspaces tab)" → updateSpace(id, settings): only sort_mode.
  const onSortModeChange = (mode: 'alphabetical' | 'manual') => {
    void updateSortMode({ variables: { id: spaceId, settings: { sort_mode: mapSortModeToBackend(mode) } } });
  };

  const onSelectDefaultTemplate = (templateId: string) => {
    void setTemplateDefault({ variables: { scope: spaceId, template: templateId } });
    setSelectDefaultTemplateOpen(false);
  };

  return {
    subspaces,
    loading: listLoading || hasMore || defaultTemplate.loading,
    sortMode,
    onSortModeChange,
    onKebabAction,
    onReorder,
    onChangeDefaultTemplate: () => setSelectDefaultTemplateOpen(true),
    pendingDelete,
    confirmDelete,
    cancelDelete,
    saveAsTemplateSubspaceId,
    closeSaveAsTemplate: () => setSaveAsTemplateSubspaceId(null),
    selectDefaultTemplateOpen,
    openSelectDefaultTemplate: () => setSelectDefaultTemplateOpen(true),
    closeSelectDefaultTemplate: () => setSelectDefaultTemplateOpen(false),
    onSelectDefaultTemplate,
    defaultTemplateId: defaultTemplate.templateId,
    subspaceTemplateChoices,
    subspaceTemplatesLoading: loadingSubspaceTemplates,
    subspaceTemplatesSaving: updatingTemplateDefault,
  };
}
