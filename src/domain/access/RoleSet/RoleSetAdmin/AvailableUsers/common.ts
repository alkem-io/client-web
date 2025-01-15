export const AVAILABLE_USERS_PAGE_SIZE = 2;

export type AvailableUsersResponse = {
  users: {
    id: string;
    profile: {
      displayName: string;
    };
    email?: string;
  }[];
  hasMore: boolean;
  fetchMore: () => Promise<unknown>;
  loading: boolean;
  refetch: () => Promise<unknown>;
};
