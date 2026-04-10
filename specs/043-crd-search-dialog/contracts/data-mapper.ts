/**
 * Data Mapper Contracts
 *
 * These functions transform GraphQL search result fragments into CRD component prop types.
 * They live in the integration layer (src/main/search/), NOT in src/crd/.
 */

import type {
  PostResultCardData,
  ResponseResultCardData,
  UserResultCardData,
  OrgResultCardData,
  SearchCategoryData,
  SearchCategoryId,
} from './search-components';

// Existing type from CRD spaces migration — reused for space search results
// import type { SpaceCardData } from '@/crd/components/space/SpaceCard';

/**
 * Maps space search results (spaceResults) to SpaceCardData[].
 * Reuses the existing SpaceCard component and its data type.
 */
// export function mapSpaceResults(results: SearchResultSpaceFragment[]): SpaceCardData[]

/**
 * Maps callout + framing results (interlaced) to PostResultCardData[].
 * Preserves the current interlacing logic from SearchView.tsx.
 */
// export function mapPostResults(
//   calloutResults: SearchResultCalloutFragment[],
//   framingResults: (SearchResultMemoFragment | SearchResultWhiteboardFragment)[]
// ): PostResultCardData[]

/**
 * Maps contribution results to ResponseResultCardData[].
 */
// export function mapResponseResults(
//   contributionResults: (SearchResultPostFragment | SearchResultMemoFragment | SearchResultWhiteboardFragment)[]
// ): ResponseResultCardData[]

/**
 * Maps actor results (USER type only) to UserResultCardData[].
 */
// export function mapUserResults(results: SearchResultUserFragment[]): UserResultCardData[]

/**
 * Maps actor results (ORGANIZATION type only) to OrgResultCardData[].
 */
// export function mapOrgResults(results: SearchResultOrganizationFragment[]): OrgResultCardData[]

/**
 * Assembles all categories from mapped results into SearchCategoryData[].
 * Filters out empty categories. Attaches filter configs, callbacks, and pagination state.
 */
// export function assembleCategories(
//   mappedResults: { spaces, posts, responses, users, organizations },
//   filterState: Record<SearchCategoryId, string>,
//   visibleCounts: Record<SearchCategoryId, number>,
//   callbacks: { onFilterChange, onLoadMore }
// ): SearchCategoryData[]
