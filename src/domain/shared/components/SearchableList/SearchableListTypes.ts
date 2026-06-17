import type { ReactNode } from 'react';

export interface SearchableListItem {
  id: string;
  accountId?: string;
  value: string;
  url: string;
  email?: string;
  verified?: boolean;
  activeLicensePlanIds?: string[];
  avatar?: {
    uri: string;
  };
}

export interface SearchableListProps<Item extends SearchableListItem> {
  data: Item[] | undefined;
  active?: number | string;
  onDelete?: (item: Item) => void;
  loading: boolean;
  fetchMore: () => Promise<void>;
  pageSize: number;
  firstPageSize?: number;
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  totalCount?: number;
  hasMore: boolean | undefined;
  itemActions?: (item: Item) => ReactNode;
}
