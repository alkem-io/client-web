/**
 * CRD SpaceCard Component Contract
 *
 * This file defines the prop interfaces for the CRD SpaceCard component.
 * These types live in src/crd/components/space/SpaceCard.tsx in production.
 *
 * ALL types are plain TypeScript — no GraphQL, no MUI, no domain imports.
 */

// --- SpaceCard ---

export type SpaceLead = {
  name: string;
  avatarUrl: string;
  type: 'person' | 'org';
};

export type SpaceCardParent = {
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor: string;
};

export type SpaceCardData = {
  id: string;
  name: string;
  description: string;
  bannerImageUrl?: string;
  initials: string;
  avatarColor: string;
  isPrivate: boolean;
  tags: string[];
  leads: SpaceLead[];
  href: string;
  matchedTerms?: boolean;
  parent?: SpaceCardParent;
};

export type SpaceCardProps = {
  space: SpaceCardData;
  className?: string;
};

// --- SpaceExplorer (page-level composite) ---

export type SpacesFilterValue = 'all' | 'member' | 'public';

export type SpaceExplorerProps = {
  spaces: SpaceCardData[];
  loading: boolean;
  hasMore?: boolean;
  searchTerms: string[];
  membershipFilter: SpacesFilterValue;
  authenticated: boolean;
  loadingSearchResults?: boolean;
  onSearchTermsChange: (terms: string[]) => void;
  onMembershipFilterChange?: (filter: SpacesFilterValue) => void;
  onLoadMore: () => Promise<void>;
};
