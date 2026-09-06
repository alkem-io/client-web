import { ClassificationCardinality as GqlClassificationCardinality } from '@/core/apollo/generated/graphql-schema';
import type { ClassificationCardinality } from '@/crd/components/classification/types';

/** GraphQL `ClassificationCardinality` enum → the CRD plain-string union. */
export function mapGqlClassificationCardinality(gql: GqlClassificationCardinality): ClassificationCardinality {
  switch (gql) {
    case GqlClassificationCardinality.SingleSelect:
      return 'SINGLE_SELECT';
    case GqlClassificationCardinality.MultiSelect:
      return 'MULTI_SELECT';
  }
}

/** CRD plain-string union → GraphQL `ClassificationCardinality` enum. */
export function toGqlClassificationCardinality(cardinality: ClassificationCardinality): GqlClassificationCardinality {
  switch (cardinality) {
    case 'SINGLE_SELECT':
      return GqlClassificationCardinality.SingleSelect;
    case 'MULTI_SELECT':
      return GqlClassificationCardinality.MultiSelect;
  }
}
