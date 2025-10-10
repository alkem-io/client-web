import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';

export interface MemoFieldSubmittedValues {
  contentUpdatePolicy?: ContentUpdatePolicy;
  profile: {
    displayName: string;
    preview?: VisualModel;
    url?: string;
  };
  markdown?: string;
}
