import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';

export type ClassificationTagsetModel = {
  name: TagsetReservedName | string;
  tags: string[];
};

export type ClassificationTagsetWithAllowedValuesModel = ClassificationTagsetModel & {
  allowedValues: string[];
};