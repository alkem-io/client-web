import produce from 'immer';
import { SvgIconProps } from '@mui/material';
import { compact, sortBy } from 'lodash';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import {
  useSpaceStorageAdminPageLazyQuery,
  useStorageAggregatorLookupLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import HistoryIcon from '@mui/icons-material/History';
import { formatFileSize } from '../../../../../core/utils/Storage';
import {
  DocumentDataFragment,
  StorageBucketFragment,
  StorageBucketParentFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import ImageIcon from '@mui/icons-material/Image';
import { profileIcon } from '../../../../shared/icons/profileIcon';

interface TreeItem {
  id: string;
  displayName: string;
  iconComponent?: ComponentType<SvgIconProps>;
  childItems?: TreeItem[];
  // Documents only
  size: string;
  uplodadedBy?: string;
  uploadedAt?: string;
  url: string;
  // UI:
  open: boolean;
  expandable: boolean;
  loaded: boolean;
  nestLevel: number;
}

interface TreeData {
  rows: TreeItem[];
}

interface Provided {
  data: TreeData;
  loadBranch: (storageAggregatorId: string) => Promise<void>;
}

const useStorageAdminTree = ({ spaceNameId }: { spaceNameId: string }): Provided => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState<TreeData>({ rows: [] });

  const [loadSpace, { loading: loadingSpace, refetch }] = useSpaceStorageAdminPageLazyQuery();
  const [loadStorage, { loading: loadingStorage }] = useStorageAggregatorLookupLazyQuery();

  // Only pass objects that can be mutated here:
  const addDirectStorage = (
    directStorage: { id: string; size: number; documents: DocumentDataFragment[] },
    nestLevel: number,
    rows: TreeItem[]
  ) => {
    rows.push({
      id: directStorage.id,
      size: formatFileSize(directStorage.size),
      expandable: true,
      url: '',
      nestLevel,
      open: false,
      loaded: true,
      childItems: directStorage.documents.map(document => ({
        id: document.id,
        size: formatFileSize(document.size),
        displayName: document.displayName,
        iconComponent: ImageIcon,
        expandable: false,
        url: document.url,
        nestLevel: nestLevel + 1,
        open: false,
        loaded: true,
      })),
    });
  };

  const addStorageBucket = (storageBucket: StorageBucketFragment, nestLevel: number, rows: TreeItem[]) => {
    const parent = storageBucket.parentEntity
      ? {
          displayName: storageBucket.parentEntity.displayName,
          iconComponent: profileIcon(storageBucket.parentEntity.type),
          url: storageBucket.parentEntity.
        }
      : {
          displayName: t('pages.admin.generic.sections.storage.directlyStored'),
          iconComponent: HistoryIcon,
        };

    rows.push({
      id: storageBucket.id,
      size: formatFileSize(storageBucket.size),
      ...parent
      iconComponent: HistoryIcon,
      expandable: true,
      nestLevel,
      open: false,
      loaded: true,
      childItems: storageBucket.documents.map(document => ({
        id: document.id,
        size: formatFileSize(document.size),
        displayName: document.displayName,
        iconComponent: ImageIcon,
        expandable: false,
        url: document.url,
        nestLevel: nestLevel + 1,
        open: false,
        loaded: true,
      })),
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await loadSpace({ variables: { spaceNameId } });
      const storageAggregator = data?.space.storageAggregator;
      produce(treeData, next => {
        const storageBuckets = storageAggregator?.storageBuckets;
        storageBuckets?.forEach(storageBucket =>
          addStorageBucket(
            {
              id: storageBucket.id,
              displayName: storageBucket,
            },
            next.rows
          )
        );
        const directStorage = storageAggregator?.directStorageBucket;
        if (directStorage && directStorage.documents.length > 0) {
          addDirectStorage(directStorage, 0, next.rows);
        }
      });
    };
    fetchData();
  }, []);

  /*
  const result = useMemo(() => {
    return sortBy(
      [
        ...compact(
          data?.space.storageAggregator?.directStorageBucket?.documents.map<DocumentDataFragmentWithLocation>(doc => ({
            ...doc,
            location: {
              type: 'space',
              displayName: data?.space.profile.displayName,
              url: buildSpaceUrl(data?.space.nameID),
            },
          }))
        ),
        ...compact(
          data?.space.challenges?.flatMap(challenge =>
            challenge.storageAggregator?.directStorageBucket?.documents.map<DocumentDataFragmentWithLocation>(doc => ({
              ...doc,
              location: {
                type: 'challenge',
                displayName: challenge.profile.displayName,
                url: buildChallengeUrl(data?.space.nameID, challenge.nameID),
              },
            }))
          )
        ),
      ],
      row => row.displayName
    );
  }, [data]);
  */

  const loadBranch = async (storageAggregatorId: string) => {
    const data = await loadStorage({ variables: { storageAggregatorId } });

    return Promise.resolve();
  };

  return {
    data: result,
    loadBranch,
  };
};

export default useStorageAdminTree;
