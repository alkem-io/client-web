/**
 * CRD Layout Component Contracts
 *
 * These types define the prop interfaces for the CRD layout components.
 * Layout components live in src/crd/layouts/ and are purely presentational.
 * Shared types live in src/crd/layouts/types.ts.
 *
 * ALL types are plain TypeScript — no GraphQL, no MUI, no domain imports.
 */

// --- Navigation hrefs ---

export type CrdNavigationHrefs = {
  home: string;
  spaces: string;
  messages: string;
  notifications: string;
  profile: string;
  account: string;
  admin: string;
  login: string;
};

// --- User info for header ---

export type CrdUserInfo = {
  name: string;
  avatarUrl?: string;
  initials: string;
  /** Platform role display name (e.g. "Global Admin", "Beta Tester"). Shown under user name in dropdown. */
  role?: string;
};

// --- Language option for footer and header language sub-menu ---

export type CrdLanguageOption = {
  code: string;
  label: string;
};

// --- Header ---

export type CrdHeaderProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  /** Whether the user has platform admin privileges. Controls visibility of Administration menu item. */
  isAdmin?: boolean;
  /** Count of pending invitations. Shown as badge on Pending Memberships menu item. */
  pendingInvitationsCount?: number;
  /** Language options for the header language sub-menu. Reused from the same source as Footer. */
  languages?: CrdLanguageOption[];
  /** Current language code for the language sub-menu active indicator. */
  currentLanguage?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
  /** Callback for Messages button. If provided, renders a button; otherwise falls back to <a href>. */
  onMessagesClick?: () => void;
  /** Callback for Notifications button. If provided, renders a button; otherwise falls back to <a href>. */
  onNotificationsClick?: () => void;
  /** Callback for Search button. If provided, renders a button; otherwise renders a no-op button. */
  onSearchClick?: () => void;
  /** Callback for Pending Memberships menu item. Only shown when provided (authenticated users). */
  onPendingMembershipsClick?: () => void;
  /** Callback for Get Help menu item. Opens HelpDialog via CrdLayoutWrapper. */
  onHelpClick?: () => void;
  /** Callback for language change in the header sub-menu. */
  onLanguageChange?: (code: string) => void;
  className?: string;
};

// --- Footer ---

export type CrdFooterProps = {
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  className?: string;
};

// --- CrdLayout (full-page shell) ---

export type CrdLayoutProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  isAdmin?: boolean;
  pendingInvitationsCount?: number;
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onLogout?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onPendingMembershipsClick?: () => void;
  onHelpClick?: () => void;
  children: React.ReactNode;
};
