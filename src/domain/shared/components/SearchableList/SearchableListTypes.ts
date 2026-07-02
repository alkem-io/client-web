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
