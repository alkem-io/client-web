/**
 * CRD Dashboard Sidebar Component Contracts
 */

// --- Sidebar Resource Item ---

export type SidebarResourceData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
};

export type SidebarResourceItemProps = SidebarResourceData & {
  className?: string;
};

// --- Sidebar Menu Item ---

export type SidebarMenuItemData = {
  id: string;
  label: string;
  iconName: string; // lucide-react icon name
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
};

// --- Sidebar Resource Section ---

export type SidebarResourceSection = {
  title: string;
  items: SidebarResourceData[];
};

// --- Dashboard Sidebar ---

export type DashboardSidebarProps = {
  menuItems: SidebarMenuItemData[];
  resourceSections: SidebarResourceSection[];

  // Activity View toggle
  activityEnabled: boolean;
  onActivityToggle: (enabled: boolean) => void;

  className?: string;
};

// --- Memberships Tree Dialog ---

export type MembershipTreeNodeData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
  roles: string[];
  children: MembershipTreeNodeData[];
};

export type MembershipsTreeDialogProps = {
  open: boolean;
  onClose: () => void;
  nodes: MembershipTreeNodeData[];
  seeMoreHref?: string;
  createSpaceHref?: string;
};

// --- Tips and Tricks Dialog ---

export type TipItemData = {
  id: string;
  title: string;
  description: string;
  href?: string;
  iconUrl?: string;
};

export type TipsAndTricksDialogProps = {
  open: boolean;
  onClose: () => void;
  tips: TipItemData[];
  forumHref: string;
};
