import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';

export type ClassificationTagsetModel = {
  name: TagsetReservedName;
  tags: string[];
};
