import { TagsetType, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';

export interface TagsetModel {
  id: string;
  name: TagsetReservedName | string;
  tags: string[];
  allowedValues: string[];
  type: TagsetType;
}

export interface TagsetFormValue {
  name: string;
  tags: string[];
}

export interface UpdateTagsetModel {
  id: string;
  name?: string;
  tags?: string[];
}

export const EmptyTagset: TagsetModel = {
  id: '',
  name: TagsetReservedName.Default,
  tags: [],
  allowedValues: [],
  type: TagsetType.Freeform,
};
