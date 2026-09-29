export const AVAILABLE_USERS_PAGE_SIZE = 10;
export const AVAILABLE_CONTRIBUTORS_PAGE_SIZE = 100;

/**
 * Coerces whatever a caller passed into a usable page size.
 *
 * `fetchMore` is declared here as zero-argument, but the implementations used to accept an
 * optional `itemsNumber` and forward it straight into the query's `first` variable. A
 * consumer that wired `fetchMore` to a button (`onClick={fetchMore}`) therefore handed React's
 * `MouseEvent` to Apollo, which threw "Converting circular structure to JSON" while
 * serialising the variables and never loaded the next page (client-web#10318).
 *
 * The type alone could not catch it: consumers see the zero-argument signature, so passing it
 * as a handler type-checks. Hence a runtime guard — anything that is not a positive, finite
 * number falls back to the page size.
 */
export const resolvePageSize = (itemsNumber: unknown, pageSize: number): number =>
  typeof itemsNumber === 'number' && Number.isFinite(itemsNumber) && itemsNumber > 0 ? itemsNumber : pageSize;

type AvailableContributorsResponse = {
  hasMore: boolean;
  fetchMore: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
  loading: boolean;
};

export type AvailableUsersResponse = {
  users: {
    id: string;
    profile?: {
      displayName: string;
    };
    email?: string;
  }[];
} & AvailableContributorsResponse;

export type AvailableOrganizationsResponse = {
  organizations: {
    id: string;
    profile?: {
      displayName: string;
    };
  }[];
} & AvailableContributorsResponse;

export type AvailableVirtualContributorsResponse = {
  virtualContributors: {
    id: string;
    profile?: {
      displayName: string;
      url: string;
    };
  }[];
} & AvailableContributorsResponse;
