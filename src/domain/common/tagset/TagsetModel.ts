import { TagsetType, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';

export interface TagsetModel {
  id: string;
  name: TagsetReservedName | string;
  tags: string[];
  allowedValues: string[];
  type: TagsetType;
}

// Example factory for a default TagsetModel
export function createDefaultTagset(tags: string[] = []): TagsetModel {
  return {
    id: '-1',
    name: TagsetReservedName.Default,
    tags,
    allowedValues: [],
    type: TagsetType.Freeform,
  };
}
