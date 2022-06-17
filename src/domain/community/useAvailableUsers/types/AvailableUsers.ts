import { UserDisplayNameFragment } from '../../../../models/graphql-schema';
import { UseUsersSearchResult } from '../../useAvailableMembersWithCredential/useUsersSearch';

export type UseAvailableUsersProvided = {
  allPossibleMemberUsers: UserDisplayNameFragment[] | undefined;
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
  setSearchTerm: UseUsersSearchResult['setSearchTerm'];
};
