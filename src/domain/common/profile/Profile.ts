import { TagsetType } from '../../../core/apollo/generated/graphql-schema';

export interface Tagset {
  id?: string;
  name: string;
  tags?: string[];
  allowedValues: string[];
  type: TagsetType;
}
export interface UpdateTagset {
  id: string;
  name: string;
  tags?: string[];
}

export interface Reference {
  id: string;
  name: string;
  uri: string;
  description?: string;
}
