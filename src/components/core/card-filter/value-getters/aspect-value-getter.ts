import { ValueType } from '../filterFn';
import { AspectCardFragment } from '../../../../models/graphql-schema';

export const aspectValueGetter = ({
  id,
  displayName,
  tagset,
  defaultDescription,
  typeDescription,
  type,
}: AspectCardFragment): ValueType => ({
  id,
  values: [displayName, defaultDescription || '', typeDescription || '', type || '', (tagset?.tags || []).join(' ')],
});

export const aspectTagsValueGetter = ({ tagset }: AspectCardFragment): string[] => tagset?.tags || [];
