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
  /** Per-row delete gate, read off the entity's `authorization.myPrivileges`.
   * `undefined` keeps the action (lists that carry no privileges). */
  canDelete?: boolean;
};

/** Maps the GraphQL `SearchVisibility` enum to the CRD chip variant. */
export const toSearchVisibility = (visibility: SearchVisibility): 'public' | 'internal' =>
  visibility === SearchVisibility.Public ? 'public' : 'internal';
