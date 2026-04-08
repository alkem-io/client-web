/**
 * Data Mapper Contracts
 * These define the mapping functions in src/main/crdPages/dashboard/dashboardDataMappers.ts
 * Input types reference GraphQL generated types; output types are plain CRD prop types.
 *
 * NOTE: GraphQL types here are illustrative — actual types come from
 * src/core/apollo/generated/graphql-schema.ts and may have different names.
 * The mapper implementation should import from the generated types.
 */

import type {
  CompactSpaceCardData,
  SpaceHierarchyCardData,
  InvitationCardData,
} from './dashboard-components';
import type { ActivityItemData } from './activity-feed';
import type { SidebarResourceData, MembershipTreeNodeData } from './sidebar';

/**
 * Maps recent spaces query results to compact card data.
 * Merges home space (from useHomeSpaceLookupQuery) with recent spaces.
 */
export type MapRecentSpacesToCompactCards = (
  recentSpaces: unknown[], // RecentSpace GraphQL type
  homeSpace: unknown | undefined, // HomeSpace GraphQL type
  homeSpaceId: string | undefined
) => CompactSpaceCardData[];

/**
 * Maps activity contributions to feed items.
 * Used by both space activity (useLatestContributionsQuery)
 * and personal activity (useLatestContributionsGroupedQuery).
 */
export type MapActivityToFeedItems = (
  activities: unknown[] // Activity GraphQL type
) => ActivityItemData[];

/**
 * Maps account resources to sidebar resource items.
 * Returns 4 arrays: spaces, virtualContributors, innovationHubs, innovationPacks.
 */
export type MapResourcesToSidebarItems = (
  resources: unknown // MyResources GraphQL type
) => {
  spaces: SidebarResourceData[];
  virtualContributors: SidebarResourceData[];
  innovationHubs: SidebarResourceData[];
  innovationPacks: SidebarResourceData[];
};

/**
 * Maps hierarchical memberships to tree node data.
 * Used by MyMembershipsDialog.
 */
export type MapMembershipsToTree = (
  memberships: unknown[] // MyMembership GraphQL type
) => MembershipTreeNodeData[];

/**
 * Maps pending invitations to invitation card data.
 * Accept/decline callbacks are wired in the integration layer, not in the mapper.
 */
export type MapInvitationsToCards = (
  invitations: unknown[] // PendingInvitation GraphQL type
) => Omit<InvitationCardData, 'onAccept' | 'onDecline'>[];

/**
 * Maps dashboard membership spaces to hierarchy card data.
 * Used by DashboardSpaces (activityEnabled=false view).
 */
export type MapDashboardSpaces = (
  spaces: unknown[] // DashboardMembership GraphQL type
) => SpaceHierarchyCardData[];
