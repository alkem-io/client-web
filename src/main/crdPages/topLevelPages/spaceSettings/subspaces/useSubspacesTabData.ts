import { useState } from 'react';
import {
  refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery,
  refetchSubspacesInSpaceQuery,
  useDeleteSpaceMutation,
  useSpaceAdminDefaultSpaceTemplatesDetailsQuery,
  useSpaceContentTemplatesOnSpaceQuery,
  useSubspacesInSpaceQuery,
  useUpdateSpaceSettingsMutation,
  useUpdateSubspacePinnedMutation,
  useUpdateSubspacesSortOrderMutation,
  useUpdateTemplateDefaultMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceSortMode, TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import type { SubspaceKebabAction, SubspaceTile } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import { mapSortMode, mapSubspaceToTile } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/subspacesMapper';

export type UseSubspacesTabDataResult = {
  subspaces: SubspaceTile[];
  canCreate: boolean;
  canSaveAsTemplate: boolean;
  templatesSetId: string | undefined;
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

export function useSubspacesTabData(spaceId: string): UseSubspacesTabDataResult {
  const { data: subspacesData, loading: subspacesLoading } = useSubspacesInSpaceQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const { data: templateData, loading: templateLoading } = useSpaceAdminDefaultSpaceTemplatesDetailsQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const backendSortMode = subspacesData?.lookup.space?.settings.sortMode ?? SpaceSortMode.Alphabetical;

  const rawSubspaces =
    subspacesData?.lookup.space?.subspaces?.map(s => ({
      ...s,
      about: { profile: { displayName: s.about.profile.displayName } },
    })) ?? [];

  const sortedRaw = useSubspacesSorted(rawSubspaces, backendSortMode);

  const subspaces: SubspaceTile[] = sortedRaw.map(raw => {
    const original = subspacesData?.lookup.space?.subspaces?.find(s => s.id === raw.id);
    if (!original) return mapSubspaceToTile(raw as never);
    return mapSubspaceToTile(original);
  });

  const templatesManager = templateData?.lookup.space?.templatesManager;
  const templatesSet = templatesManager?.templatesSet;
  const templateSetPrivileges = templatesSet?.authorization?.myPrivileges ?? [];
  const canSaveAsTemplate = templateSetPrivileges.includes(AuthorizationPrivilege.Create);

  const templateDefaults = templatesManager?.templateDefaults;
  const defaultSubspaceTemplate = templateDefaults?.find(td => td.type === TemplateDefaultType.SpaceSubspace);

  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [saveAsTemplateSubspaceId, setSaveAsTemplateSubspaceId] = useState<string | null>(null);
  const [selectDefaultTemplateOpen, setSelectDefaultTemplateOpen] = useState(false);

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const [updateSubspacePinned] = useUpdateSubspacePinnedMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
    awaitRefetchQueries: true,
  });
  const [updateSubspacesSortOrder] = useUpdateSubspacesSortOrderMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
  });
  const [updateSpaceSettings] = useUpdateSpaceSettingsMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
    awaitRefetchQueries: true,
  });
  const [updateTemplateDefault, { loading: updatingTemplateDefault }] = useUpdateTemplateDefaultMutation({
    refetchQueries: [refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const { data: templatesOnSpaceData, loading: loadingSubspaceTemplates } = useSpaceContentTemplatesOnSpaceQuery({
    variables: { spaceId },
    skip: !spaceId || !selectDefaultTemplateOpen,
  });
  const subspaceTemplateChoices =
    templatesOnSpaceData?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates.map(tmpl => ({
      id: tmpl.id,
      name: tmpl.profile.displayName,
    })) ?? [];

  const onKebabAction = (id: string, action: SubspaceKebabAction) => {
    if (action === 'delete') {
      const ss = subspaces.find(s => s.id === id);
      setPendingDelete({ id, name: ss?.name ?? '' });
    } else if (action === 'pinToggle') {
      const ss = subspaces.find(s => s.id === id);
      void updateSubspacePinned({
        variables: {
          pinnedData: {
            spaceID: spaceId,
            subspaceID: id,
            pinned: !(ss?.isPinned ?? false),
          },
        },
      });
    } else if (action === 'saveAsTemplate') {
      setSaveAsTemplateSubspaceId(id);
    }
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      void deleteSpace({ variables: { spaceId: pendingDelete.id } });
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const onReorder = (subspaceIds: string[]) => {
    void updateSubspacesSortOrder({
      variables: { spaceID: spaceId, subspaceIds },
    });
  };

  const onSortModeChange = (mode: 'alphabetical' | 'manual') => {
    void updateSpaceSettings({
      variables: {
        settingsData: {
          spaceID: spaceId,
          settings: { sortMode: mode === 'manual' ? SpaceSortMode.Custom : SpaceSortMode.Alphabetical },
        },
      },
    });
  };

  const onSelectDefaultTemplate = (templateId: string) => {
    if (!defaultSubspaceTemplate) return;
    void updateTemplateDefault({
      variables: {
        templateDefaultID: defaultSubspaceTemplate.id,
        templateID: templateId,
      },
    });
    setSelectDefaultTemplateOpen(false);
  };

  return {
    subspaces,
    canCreate: true,
    canSaveAsTemplate,
    templatesSetId: templatesSet?.id,
    loading: subspacesLoading || templateLoading,
    sortMode: mapSortMode(backendSortMode),
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
    defaultTemplateId: defaultSubspaceTemplate?.template?.id,
    subspaceTemplateChoices,
    subspaceTemplatesLoading: loadingSubspaceTemplates,
    subspaceTemplatesSaving: updatingTemplateDefault,
  };
}
