import { ValueType } from '../filterFn';
import { Challenge, Hub, Opportunity } from '../../../../../models/graphql-schema';

type EntityType = Hub | Challenge | Opportunity;

export const entityValueGetter = ({ id, displayName, tagset, context: c }: EntityType): ValueType => ({
  id,
  values: [
    displayName,
    c?.tagline || '',
    c?.background || '',
    c?.impact || '',
    c?.vision || '',
    c?.who || '',
    (tagset?.tags || []).join(' '),
  ],
});

export const entityTagsValueGetter = ({ tagset }: EntityType): string[] => tagset?.tags || [];
