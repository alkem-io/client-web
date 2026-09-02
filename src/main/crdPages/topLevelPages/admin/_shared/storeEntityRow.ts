import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import type { AdminTableRow } from '@/crd/components/admin/AdminSearchableTable';

/**
 * Shared row shape for the store-listable admin sections (Innovation Packs,
 * Innovation Hubs, Virtual Contributors).
 */
export type AdminStoreEntityRow = AdminTableRow & {
  listedInStore: boolean;
  searchVisibility: 'public' | 'internal';
  accountOwner: string;
};

/** Maps the GraphQL `SearchVisibility` enum to the CRD chip variant. */
export const toSearchVisibility = (visibility: SearchVisibility): 'public' | 'internal' =>
  visibility === SearchVisibility.Public ? 'public' : 'internal';
