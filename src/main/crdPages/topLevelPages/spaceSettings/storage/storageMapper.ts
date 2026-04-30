import type {
  DocumentDataFragment,
  StorageAggregatorFragment,
  StorageBucketFragment,
} from '@/core/apollo/generated/graphql-schema';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { formatFileSize } from '@/core/utils/Storage';
import type {
  DocumentFile,
  DocumentFolder,
  DocumentNode,
} from '@/crd/components/space/settings/SpaceSettingsStorageView';

export function mapStorageAggregatorToTree(aggregator: StorageAggregatorFragment): DocumentNode[] {
  const nodes: DocumentNode[] = [];

  for (const bucket of aggregator.storageBuckets) {
    if (bucket.documents.length > 0) {
      nodes.push(mapBucketToFolder(bucket));
    }
  }

  if (aggregator.directStorageBucket && aggregator.directStorageBucket.documents.length > 0) {
    nodes.push(mapBucketToFolder(aggregator.directStorageBucket));
  }

  for (const childAgg of aggregator.storageAggregators) {
    nodes.push({
      id: childAgg.id,
      kind: 'folder',
      name: childAgg.parentEntity?.displayName ?? childAgg.id,
      children: [],
    } satisfies DocumentFolder);
  }

  return nodes;
}

function mapBucketToFolder(bucket: StorageBucketFragment): DocumentFolder {
  return {
    id: bucket.id,
    kind: 'folder',
    name: bucket.parentEntity?.displayName ?? 'Documents',
    children: bucket.documents.map(mapDocument),
  };
}

function mapDocument(doc: DocumentDataFragment): DocumentFile {
  return {
    id: doc.id,
    kind: 'file',
    name: doc.displayName,
    sizeFormatted: formatFileSize(doc.size),
    uploaderName: doc.createdBy?.profile?.displayName ?? '',
    uploaderHref: doc.createdBy?.profile?.url ?? '',
    uploadedAt: doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : '',
    openHref: doc.url,
    canDelete: doc.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false,
  };
}
