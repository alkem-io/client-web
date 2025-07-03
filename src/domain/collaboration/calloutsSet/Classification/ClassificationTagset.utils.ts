import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { ClassificationTagsetModel } from './ClassificationTagset.model';

export const buildFlowStateClassificationTagsets = (
  flowState: string | undefined
): ClassificationTagsetModel[] | undefined => {
  if (!flowState) {
    return undefined;
  }
  return [
    {
      name: TagsetReservedName.FlowState,
      tags: [flowState],
    },
  ];
};
