import produce from 'immer';
import { SvgIconProps } from '@mui/material';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import {
  useSpaceStorageAdminPageLazyQuery,
  useStorageAggregatorLookupLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { TFunction, useTranslation } from 'react-i18next';
import HistoryIcon from '@mui/icons-material/History';
import {
  DocumentDataFragment,
  LoadableStorageAggregatorFragment,
  ProfileType,
  StorageAggregatorFragment,
  StorageBucketFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import ImageIcon from '@mui/icons-material/Image';
import { profileIcon } from '../../../../shared/icons/profileIcon';

export interface StorageAdminTreeItem {
  id: string;
  displayName: string;
  type: string; // TODO: not needed
  iconComponent?: ComponentType<SvgIconProps>;
  childItems?: StorageAdminTreeItem[];
  // Documents only
  size: number;
  uplodadedBy?: { nameId: string; displayName: string };
  uploadedAt?: Date;
  url: string | undefined;
  // UI:
  expandable: boolean;
  open: boolean;
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

const newDocumentRow = (document: DocumentDataFragment): StorageAdminTreeItem => ({
  id: document.id,
  displayName: document.displayName,
  type: 'doc',
  iconComponent: ImageIcon,
  size: document.size,
  uplodadedBy: document.createdBy
    ? {
        nameId: document.createdBy.nameID,
        displayName: document.createdBy.profile.displayName,
      }
    : undefined,
  uploadedAt: document.uploadedDate,
  expandable: false,
  url: document.url,
  open: false,
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
      type: storageBucket.parentEntity.type,
      iconComponent: profileIcon(storageBucket.parentEntity.type),
      url: storageBucket.parentEntity.url,
      size: storageBucket.size,
      expandable: storageBucket.documents.length > 0,
      open: false,
      loaded: true,
      childItems: storageBucket.documents.map(document => newDocumentRow(document)),
    };
  } else {
    return {
      id: storageBucket.id,
      displayName: t('pages.admin.generic.sections.storage.directlyStored'),
      type: 'direct',
      iconComponent: HistoryIcon,
      url: undefined,
      size: storageBucket.size,
      expandable: storageBucket.documents.length > 0,
      open: false,
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
      type: 'LSAGG',
      iconComponent: profileIcon(ProfileType.Challenge),
      url: storageAggregator.parentEntity.url,
      size: 0,
      expandable: true,
      open: false,
      loaded: false,
      childItems: [],
    };
  } else {
    return {
      id: storageAggregator.id,
      displayName: `No parent ${storageAggregator.id}`,
      type: 'LSAGG',
      iconComponent: profileIcon(ProfileType.Challenge),
      url: undefined,
      size: 0,
      expandable: true,
      open: false,
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

const useStorageAdminTree = ({ spaceNameId }: { spaceNameId: string }): Provided => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState<TreeData>({ root: [] });

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

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await loadSpace({ variables: { spaceNameId: spaceNameId } });
      const storageAggregator = data?.space.storageAggregator;
      if (!storageAggregator) {
        console.error('Cannot find storageAggregator');
        return;
      }

      setTreeData(treeData =>
        produce(treeData, next => {
          addStorageAggregator(storageAggregator, next.root);
          return next;
        })
      );
    };
    fetchData();
  }, []);

  const setBranchLoading = async (storageAggregatorId: string, loading: boolean) => {
    setTreeData(treeData =>
      produce(treeData, next => {
        const branch = findBranch(next.root, storageAggregatorId);
        if (branch) {
          branch.loading = loading;
        }
        return next;
      })
    );
  };

  const loadBranch = (storageAggregatorId: string) => {
    setTimeout(async () => {
      setBranchLoading(storageAggregatorId, true);

      // Load the data
      const { data } = await loadStorage({ variables: { storageAggregatorId }, errorPolicy: 'ignore' });
      const storageAggregator = data?.lookup.storageAggregator;
      if (!storageAggregator) {
        console.error('Cannot load storageAggregator', storageAggregatorId);
        setBranchLoading(storageAggregatorId, false);
        return;
      }
      setTreeData(treeData =>
        produce(treeData, next => {
          const branch = findBranch(next.root, storageAggregatorId);
          if (branch) {
            branch.type = 'SAGG';
            branch.open = true;
            branch.loading = false;
            branch.loaded = true;
            branch.childItems = branch.childItems ?? [];
            addStorageAggregator(storageAggregator, branch.childItems);
          }
          return next;
        })
      );
    }, 100);
  };

  const openBranch = async (storageAggregatorId: string) => {
    setTreeData(treeData =>
      produce(treeData, next => {
        const branch = findBranch(next.root, storageAggregatorId);
        if (branch && branch.expandable) {
          if (branch.open) {
            return next;
          } else if (branch.loaded) {
            branch.open = true;
          } else {
            loadBranch(storageAggregatorId);
          }
        }
        return next;
      })
    );
  };

  const closeBranch = (storageAggregatorId: string) => {
    setTreeData(treeData =>
      produce(treeData, next => {
        const branch = findBranch(next.root, storageAggregatorId);
        if (branch && branch.expandable) {
          if (!branch.open) {
            return next;
          } else {
            branch.open = false;
          }
        }
        return next;
      })
    );
  };

  // Flat the tree to convert it into a grid
  const result = useMemo(() => {
    const result: StorageAdminGridRow[] = [];

    const addChildren = (rows: StorageAdminTreeItem[], nestLevel: number) => {
      rows.forEach(row => {
        const { childItems, ...gridRow } = row;
        result.push({ ...gridRow, nestLevel: nestLevel + 1 });
        if (gridRow.open && childItems) {
          addChildren(childItems, nestLevel + 1);
        }
      });
    };

    treeData.root.forEach(row => {
      const { childItems, ...gridRow } = row;
      result.push({ ...gridRow, nestLevel: 0 });
      if (gridRow.open && childItems) {
        addChildren(childItems, 0);
      }
    });

    return result;
  }, [treeData]);

  return {
    data: result,
    loading: loadingSpace,
    openBranch,
    closeBranch,
    reload: refetch,
  };
};

export default useStorageAdminTree;
