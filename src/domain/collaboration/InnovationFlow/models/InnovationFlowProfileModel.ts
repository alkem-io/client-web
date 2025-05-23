import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { Visual } from '@/domain/common/visual/Visual';

export interface InnovationFlowProfileModel {
  id: string;
  displayName: string;
  description?: string;
  bannerNarrow?: Visual;
  tags?: {
    tags: string[];
  };
  tagsets?: TagsetModel[];
  references?: ReferenceModel[];
}
