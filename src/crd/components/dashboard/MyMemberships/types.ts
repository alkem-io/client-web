export type MembershipRole = 'admin' | 'lead' | 'member';

export type MembershipItem = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  isPrivate: boolean;
  roles: MembershipRole[];
  initials: string;
  color: string;
  image?: string;
  children?: MembershipItem[];
};

export type MyMembershipsPanelProps = {
  open: boolean;
  onClose: () => void;
  items: MembershipItem[];
  loading?: boolean;
  onNavigate: (href: string) => void;
  browseAllHref: string;
  /** Overrides the default "My Spaces" panel title (e.g. when scoped to a home section). */
  title?: string;
  /**
   * When set, the panel only shows items whose roles intersect these roles and the role
   * filter control is hidden (the set is already scoped). Used by the non-activity home
   * "show more" for the Lead & Administer section.
   */
  restrictToRoles?: MembershipRole[];
  /**
   * Hides the role filter without role-scoping the items — for sections whose items
   * carry no meaningful membership role (e.g. "I Host": account Spaces, not memberships).
   */
  hideRoleFilter?: boolean;
};
