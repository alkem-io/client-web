import { ValueType } from '../filterFn';
import { AspectCardFragment } from '../../../../models/graphql-schema';

export const aspectValueGetter = ({ id, displayName, tagset, description, type }: AspectCardFragment): ValueType => ({
  id,
  values: [displayName, description || '', type || '', (tagset?.tags || []).join(' ')],
});

export const aspectTagsValueGetter = ({ tagset }: AspectCardFragment): string[] => tagset?.tags || [];
