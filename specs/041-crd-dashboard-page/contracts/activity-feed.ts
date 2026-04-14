/**
 * CRD Activity Feed Component Contracts
 * Covers ActivityFeed, ActivityItem, and ActivityDialog components.
 */

// --- Activity Item ---

export type ActivityItemData = {
  id: string;
  avatarUrl?: string;
  avatarInitials: string;
  userName: string;
  actionText: string;
  targetName: string;
  targetHref?: string;
  timestamp: string; // ISO date string
};

export type ActivityItemProps = ActivityItemData & {
  className?: string;
};

// --- Activity Feed Filter ---

export type ActivityFilterOption = {
  value: string;
  label: string;
};

// --- Activity Feed ---

export type ActivityFeedVariant = 'spaces' | 'personal';

export type ActivityFeedProps = {
  variant: ActivityFeedVariant;
  title: string;
  items: ActivityItemData[];
  loading?: boolean;

  // Filter state (controlled)
  spaceFilter: string;
  spaceFilterOptions: ActivityFilterOption[];
  onSpaceFilterChange: (value: string) => void;

  // Role filter (only shown when variant='spaces')
  roleFilter?: string;
  roleFilterOptions?: ActivityFilterOption[];
  onRoleFilterChange?: (value: string) => void;

  // "Show more" action
  onShowMore?: () => void;

  className?: string;
};

// --- Activity Dialog ---

export type ActivityDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};
