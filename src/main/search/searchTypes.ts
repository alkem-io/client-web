import type {
  SearchResult,
  SearchResultCalloutFragment,
  SearchResultMemoFragment,
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultType,
  SearchResultUserFragment,
  SearchResultWhiteboardFragment,
} from '@/core/apollo/generated/graphql-schema';

export type TypedSearchResult<Type extends SearchResultType, ResultFragment extends {}> = SearchResult &
  ResultFragment & { type: Type };

export type SearchResultMetaType =
  | TypedSearchResult<SearchResultType.User, SearchResultUserFragment>
  | TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>
  | TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>
  | TypedSearchResult<SearchResultType.Space, SearchResultSpaceFragment>
  | TypedSearchResult<SearchResultType.Subspace, SearchResultSpaceFragment>
  | TypedSearchResult<SearchResultType.Callout, SearchResultCalloutFragment>
  | TypedSearchResult<SearchResultType.Memo, SearchResultMemoFragment>
  | TypedSearchResult<SearchResultType.Whiteboard, SearchResultWhiteboardFragment>;

export const MAX_TERMS_SEARCH = 5;
