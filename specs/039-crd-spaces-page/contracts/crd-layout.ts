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
  settings: string;
  login: string;
};

// --- User info for header ---

export type CrdUserInfo = {
  name: string;
  avatarUrl?: string;
  initials: string;
};

// --- Language option for footer ---

export type CrdLanguageOption = {
  code: string;
  label: string;
};

// --- Header ---

export type CrdHeaderProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  onLogout?: () => void;
  onMenuClick?: () => void;
  /** Callback for Messages button. If provided, renders a button; otherwise falls back to <a href>. */
  onMessagesClick?: () => void;
  /** Callback for Notifications button. If provided, renders a button; otherwise falls back to <a href>. */
  onNotificationsClick?: () => void;
  /** Callback for Search button. If provided, renders a button; otherwise renders a no-op button. */
  onSearchClick?: () => void;
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
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onLogout?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  children: React.ReactNode;
};
