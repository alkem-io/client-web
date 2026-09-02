import { useState } from 'react';
import { useDeleteDocumentMutation, useSpaceStorageAdminPageQuery } from '@/core/apollo/generated/apollo-hooks';
import type { DocumentNode } from '@/crd/components/space/settings/SpaceSettingsStorageView';
import { mapStorageAggregatorToTree } from './storageMapper';

export type UseStorageTabDataResult = {
  tree: DocumentNode[];
  expandedFolderIds: ReadonlySet<string>;
  loading: boolean;
  onToggleFolder: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  pendingDelete: { id: string; name: string } | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
};

export function useStorageTabData(spaceId: string): UseStorageTabDataResult {
  const { data, loading, refetch } = useSpaceStorageAdminPageQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const storageAggregator = data?.lookup.space?.storageAggregator;
  const tree = storageAggregator ? mapStorageAggregatorToTree(storageAggregator) : [];

  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const [deleteDocument] = useDeleteDocumentMutation();

  const onToggleFolder = (id: string) => {
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onDelete = (id: string, name: string) => {
    setPendingDelete({ id, name });
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      void deleteDocument({ variables: { documentId: pendingDelete.id } }).then(() => refetch());
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return {
    tree,
    expandedFolderIds,
    loading,
    onToggleFolder,
    onDelete,
    pendingDelete,
    confirmDelete,
    cancelDelete,
  };
}
