import { ValueType } from '../filterFn';
import { AspectCardFragment } from '../../../../../core/apollo/generated/graphql-schema';

export const aspectValueGetter = ({ id, displayName, profile, type }: AspectCardFragment): ValueType => ({
  id,
  values: [displayName, profile?.description || '', type || '', (profile?.tagset?.tags || []).join(' ')],
});

export const aspectTagsValueGetter = ({ profile }: AspectCardFragment): string[] => profile?.tagset?.tags || [];
