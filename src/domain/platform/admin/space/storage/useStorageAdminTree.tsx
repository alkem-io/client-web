import produce from 'immer';
import { SvgIconProps } from '@mui/material';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import {
  useSpaceStorageAdminPageLazyQuery,
  useStorageAggregatorLookupLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TFunction, useTranslation } from 'react-i18next';
import HistoryIcon from '@mui/icons-material/History';
import {
  DocumentDataFragment,
  LoadableStorageAggregatorFragment,
  SpaceLevel,
  StorageAggregatorFragment,
  StorageBucketFragment,
} from '@/core/apollo/generated/graphql-schema';
import ImageIcon from '@mui/icons-material/Image';
import { getProfileIcon } from '@/domain/shared/icons/profileIcons';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import { SubspaceIcon } from '@/domain/journey/subspace/icon/SubspaceIcon';
import { OpportunityIcon } from '@/domain/journey/opportunity/icon/OpportunityIcon';
import { FolderCopyOutlined } from '@mui/icons-material';

export interface StorageAdminTreeItem {
  id: string;
  displayName: string;
  iconComponent?: ComponentType<SvgIconProps>;
  childItems?: StorageAdminTreeItem[];
  // Documents only
  size: number;
  uplodadedBy?: { url: string; displayName: string };
  uploadedAt?: Date;
  url: string | undefined;
  // UI:
  collapsible: boolean;
  collapsed: boolean;
  loaded: boolean;
  loading?: boolean;
}

export interface StorageAdminGridRow extends Omit<StorageAdminTreeItem, 'childItems'> {
  nestLevel: number;
}

interface TreeData {
  root: StorageAdminTreeItem[];
}

interface Provided {
  data: StorageAdminGridRow[];
  loading: boolean;
  openBranch: (storageAggregatorId: string) => void;
  closeBranch: (storageAggregatorId: string) => void;
  reload: () => void;
}

export const getStorageAggregatorParentIcon = (level: SpaceLevel | undefined) => {
  switch (level) {
    case SpaceLevel.L1:
      return SubspaceIcon;
    case SpaceLevel.L2:
      return OpportunityIcon;
    case SpaceLevel.L0:
    default:
      return SpaceIcon;
  }
};

const newDocumentRow = (document: DocumentDataFragment): StorageAdminTreeItem => ({
  id: document.id,
  displayName: document.displayName,
  iconComponent: ImageIcon,
  size: document.size,
  uplodadedBy: document.createdBy
    ? {
        url: document.createdBy.profile.url,
        displayName: document.createdBy.profile.displayName,
      }
    : undefined,
  uploadedAt: document.uploadedDate,
  collapsible: false,
  url: document.url,
  collapsed: false,
  loaded: true,
});

const newStorageBucketRow = (
  storageBucket: StorageBucketFragment,
  t: TFunction<'translation', undefined>
): StorageAdminTreeItem => {
  if (storageBucket.parentEntity) {
    return {
      id: storageBucket.id,
      displayName: storageBucket.parentEntity.displayName,
      iconComponent: getProfileIcon(storageBucket.parentEntity.type),
      url: storageBucket.parentEntity.url,
      size: storageBucket.size,
      collapsible: storageBucket.documents.length > 0,
      collapsed: true,
      loaded: true,
      childItems: storageBucket.documents.map(document => newDocumentRow(document)),
    };
  } else {
    return {
      id: storageBucket.id,
      displayName: t('pages.admin.generic.sections.storage.directlyStored'),
      iconComponent: HistoryIcon,
      url: undefined,
      size: storageBucket.size,
      collapsible: storageBucket.documents.length > 0,
      collapsed: true,
      loaded: true,
      childItems: storageBucket.documents.map(document => newDocumentRow(document)),
    };
  }
};
const newStorageAggregatorRow = (storageAggregator: LoadableStorageAggregatorFragment): StorageAdminTreeItem => {
  if (storageAggregator.parentEntity) {
    return {
      id: storageAggregator.id,
      displayName: storageAggregator.parentEntity.displayName,
      iconComponent: getStorageAggregatorParentIcon(storageAggregator.parentEntity.level ?? SpaceLevel.L0),
      url: storageAggregator.parentEntity.url,
      size: 0,
      collapsible: true,
      collapsed: true,
      loaded: false,
      childItems: [],
    };
  } else {
    return {
      id: storageAggregator.id,
      displayName: `(Storage aggregator without parent entity): ${storageAggregator.id}`,
      iconComponent: FolderCopyOutlined,
      url: undefined,
      size: 0,
      collapsible: true,
      collapsed: true,
      loaded: false,
      childItems: [],
    };
  }
};

const findBranch = (rows: StorageAdminTreeItem[], id: string): StorageAdminTreeItem | undefined => {
  for (const row of rows) {
    if (row.id === id) {
      return row;
    }
    if (row.childItems) {
      const found = findBranch(row.childItems, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

// Turn the tree into a grid just flattening the open branches
const tree2Grid = (treeData: TreeData, t: TFunction<'translation', undefined>): StorageAdminGridRow[] => {
  const result: StorageAdminGridRow[] = [];

  let emptyRowsCount = 0;
  const newEmptyRow = (nestLevel: number): StorageAdminGridRow => ({
    id: `emptyRow_${emptyRowsCount++}`,
    collapsed: false,
    collapsible: false,
    displayName: t('pages.admin.generic.sections.storage.emptyStorage'),
    loaded: true,
    size: 0,
    nestLevel,
    url: undefined,
  });

  // Recursive function to go deep in the tree, adding rows to result
  const addRows = (rows: StorageAdminTreeItem[], nestLevel: number) => {
    rows.forEach(row => {
      const { childItems, ...gridRow } = row;
      result.push({ ...gridRow, nestLevel: nestLevel + 1 });
      if (!gridRow.collapsed && childItems) {
        addRows(childItems, nestLevel + 1);
      }
    });
    if (rows.length === 0) {
      result.push(newEmptyRow(nestLevel + 1));
    }
  };

  treeData.root.forEach(row => {
    const { childItems, ...gridRow } = row;
    result.push({ ...gridRow, nestLevel: 0 });
    if (!gridRow.collapsed && childItems) {
      addRows(childItems, 0);
    }
  });

  return result;
};

const useStorageAdminTree = ({ spaceId }: { spaceId: string | undefined }): Provided => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState<TreeData>({ root: [] });

  // Load data from the queries:
  const [loadSpace, { loading: loadingSpace, refetch }] = useSpaceStorageAdminPageLazyQuery();
  const [loadStorage] = useStorageAggregatorLookupLazyQuery();

  const addStorageBucket = (storageBucket: StorageBucketFragment, rows: StorageAdminTreeItem[]) => {
    rows.push(newStorageBucketRow(storageBucket, t));
  };

  const addLoadableStorageAggregator = (
    storageAggregator: LoadableStorageAggregatorFragment,
    rows: StorageAdminTreeItem[]
  ) => {
    rows.push(newStorageAggregatorRow(storageAggregator));
  };

  const addStorageAggregator = (storageAggregator: StorageAggregatorFragment, rows: StorageAdminTreeItem[]) => {
    // Add children storage buckets
    storageAggregator.storageBuckets?.forEach(storageBucket => {
      if (storageBucket.documents.length > 0) {
        addStorageBucket(storageBucket, rows);
      }
    });
    // Add direct stored documents
    const directStorage = storageAggregator.directStorageBucket;
    if (directStorage && directStorage.documents.length > 0) {
      addStorageBucket(directStorage, rows);
    }
    // Add children stored aggregators (lazy loaded)
    storageAggregator.storageAggregators.forEach(childStorageAggregator =>
      addLoadableStorageAggregator(childStorageAggregator, rows)
    );
  };

  // Initial load:
  useEffect(() => {
    const fetchData = async () => {
      if (!spaceId) {
        return;
      }
      const { data } = await loadSpace({ variables: { spaceId }, errorPolicy: 'ignore' });
      const storageAggregator = data?.lookup.space?.storageAggregator;
      if (!storageAggregator) {
        throw new Error('Cannot find storageAggregator');
      }

      setTreeData(treeData =>
        produce(treeData, next => {
          addStorageAggregator(storageAggregator, next.root);
        })
      );
    };
    fetchData();
  }, [spaceId]);

  // Just a helper to set row loading state
  const setBranchLoading = async (storageAggregatorId: string, loading: boolean) => {
    setTreeData(treeData =>
      produce(treeData, next => {
        const branch = findBranch(next.root, storageAggregatorId);
        if (branch) {
          branch.loading = loading;
        }
      })
    );
  };

  // Load a lazy-loadable branch
  const loadBranch = (storageAggregatorId: string) => {
    setTimeout(async () => {
      setBranchLoading(storageAggregatorId, true);

      // Load the data
      const { data } = await loadStorage({ variables: { storageAggregatorId }, errorPolicy: 'ignore' });
      const storageAggregator = data?.lookup.storageAggregator;
      if (!storageAggregator) {
        setBranchLoading(storageAggregatorId, false);
        throw new Error(`Cannot load storageAggregator ${storageAggregatorId}`);
      }
      setTreeData(treeData =>
        produce(treeData, next => {
          // Put the children inside the branch
          const branch = findBranch(next.root, storageAggregatorId);
          if (branch) {
            branch.collapsed = false;
            branch.loading = false;
            branch.loaded = true;
            branch.childItems = branch.childItems ?? [];
            addStorageAggregator(storageAggregator, branch.childItems);
          }
        })
      );
    }, 100);
  };

  // User clicks to Collapse or unCollapse branches:
  const openBranch = async (storageAggregatorId: string) => {
    setTreeData(treeData =>
      produce(treeData, next => {
        const branch = findBranch(next.root, storageAggregatorId);
        if (branch && branch.collapsible) {
          if (branch.loaded) {
            branch.collapsed = false;
          } else {
            // If the branch is not yet loaded, query it
            loadBranch(storageAggregatorId);
          }
        }
      })
    );
  };

  const closeBranch = (storageAggregatorId: string) => {
    setTreeData(treeData =>
      produce(treeData, next => {
        const branch = findBranch(next.root, storageAggregatorId);
        if (branch && branch.collapsible) {
          branch.collapsed = true;
        }
      })
    );
  };

  return {
    data: useMemo(() => tree2Grid(treeData, t), [treeData]),
    loading: loadingSpace,
    openBranch,
    closeBranch,
    reload: refetch,
  };
};

export default useStorageAdminTree;
