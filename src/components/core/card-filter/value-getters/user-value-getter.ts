import { User } from '../../../../models/graphql-schema';
import { ValueType } from '../filterFn';

export const userValueGetter = ({ id, displayName, country, city, email, profile }: User): ValueType => ({
  id,
  values: [
    displayName,
    country,
    city,
    email,
    profile?.description || '',
    (profile?.tagsets?.flatMap(x => x.tags) || []).join(' '),
  ],
});

export const userTagsValueGetter = ({ profile }: User): string[] => profile?.tagsets?.flatMap(x => x.tags) || [];
