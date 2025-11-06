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

const validTagsetNames = Object.values(TagsetReservedName);
export const classificationTagsetModelToTagsetArgs = (tagsets: ClassificationTagsetModel[] | undefined) =>
  tagsets?.map(tagset => {
    if (!validTagsetNames.includes(tagset.name as TagsetReservedName)) {
      throw new Error(`Invalid TagsetReservedName: ${tagset.name}`);
    }
    return {
      name: tagset.name as TagsetReservedName,
      tags: tagset.tags,
    };
  });
