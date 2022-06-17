import { UserDisplayNameFragment } from '../../../../models/graphql-schema';
import { UseUsersSearchResult } from '../../useAvailableMembersWithCredential/useUsersSearch';

export interface UseAvailableUsersProvided {
  availableMembers: UserDisplayNameFragment[];
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
  setSearchTerm: UseUsersSearchResult['setSearchTerm'];
}
