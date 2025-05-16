import { TagsetType } from '@/core/apollo/generated/graphql-schema';
import { Reference } from '@/domain/common/profile/Profile';
import { Visual } from '@/domain/common/visual/Visual';

export interface InnovationFlowProfileModel {
  id: string;
  displayName: string;
  description?: string;
  bannerNarrow?: Visual;
  tags?: {
    tags: string[];
  };
  tagsets?: {
    id: string;
    name: string;
    tags: string[];
    allowedValues: string[];
    type: TagsetType;
  }[];
  references?: Reference[];
}
