import type { UpdateTagsetInput } from '@/core/apollo/generated/graphql-schema';
import type { TagsetModel } from './TagsetModel';

export const mapTagsetModelsToUpdateTagsetInputs = (
  tagsets: TagsetModel[] | undefined
): UpdateTagsetInput[] | undefined => {
  if (!tagsets) return undefined;
  return tagsets
    .filter(tagset => tagset.id) // remove all tagsets that don't have an ID
    .map(tagset => ({
      ID: tagset.id, // ensured by the filter
      name: tagset.name,
      tags: tagset.tags ?? [],
    }));
};
