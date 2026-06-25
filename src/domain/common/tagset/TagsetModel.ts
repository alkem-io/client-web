import { TagsetReservedName, TagsetType } from '@/core/apollo/generated/graphql-schema';

export interface TagsetModel {
  id: string;
  name: TagsetReservedName | string;
  tags: string[];
  allowedValues: string[];
  type: TagsetType;
}

export const EmptyTagset: TagsetModel = {
  id: '',
  name: TagsetReservedName.Default,
  tags: [],
  allowedValues: [],
  type: TagsetType.Freeform,
};
