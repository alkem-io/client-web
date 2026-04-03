/**
 * CRD Dashboard Component Contracts
 * These are the prop interfaces for CRD presentational components in src/crd/components/dashboard/
 * All types are plain TypeScript — no GraphQL types, no MUI types.
 */

// --- Compact Space Card ---

export type CompactSpaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
  isHomeSpace: boolean;
};

export type CompactSpaceCardProps = CompactSpaceCardData & {
  className?: string;
};

// --- Home Space Placeholder ---

export type HomeSpacePlaceholderProps = {
  settingsHref: string;
  className?: string;
};

// --- Recent Spaces ---

export type RecentSpacesProps = {
  spaces: CompactSpaceCardData[];
  loading?: boolean;
  onExploreAllClick?: () => void;
  className?: string;
};

// --- Dashboard Layout ---

export type DashboardLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

// --- Dashboard Spaces (hierarchical view) ---

export type SpaceHierarchyCardData = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  subspaces: Array<{
    id: string;
    name: string;
    href: string;
  }>;
};

export type SpaceHierarchyCardProps = SpaceHierarchyCardData & {
  className?: string;
};

export type DashboardSpacesProps = {
  spaces: SpaceHierarchyCardData[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSeeMoreSubspaces?: (spaceId: string) => void;
  className?: string;
};

// --- Invitations Block ---

export type InvitationCardData = {
  id: string;
  spaceName: string;
  spaceHref: string;
  senderName: string;
  senderAvatarUrl?: string;
  role: string;
};

export type InvitationsBlockProps = {
  invitations: InvitationCardData[];
  loading?: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  className?: string;
};

// --- Campaign Banner ---

export type CampaignBannerProps = {
  onAction: () => void;
  className?: string;
};

// --- Release Notes Banner ---

export type ReleaseNotesBannerProps = {
  title: string;
  content: string;
  href?: string;
  onDismiss: () => void;
  className?: string;
};
