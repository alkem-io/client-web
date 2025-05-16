import { UpdateTagsetInput } from '@/core/apollo/generated/graphql-schema';
import { TagsetModel } from './TagsetModel';

type Tagset = {
  id?: string;
  name?: string;
  tags?: string[];
};

export const findDefaultTagset = <T extends Tagset>(tagsets: T[] | undefined): T | undefined => {
  if (!tagsets) return undefined;
  const defaultTagset: T | undefined = tagsets.find(tagset => tagset.name === 'default');
  if (defaultTagset) {
    return defaultTagset;
  } else if (tagsets.length > 0 && !tagsets[0].name) {
    return tagsets[0];
  }
};

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
