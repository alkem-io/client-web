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
  /** The viewer's privileges on this item's own authorization policy (client-7). */
  orgPrivileges?: string[];
  /** The viewer's privileges on this item's verification authorization policy (client-7). */
  verificationPrivileges?: string[];
}
