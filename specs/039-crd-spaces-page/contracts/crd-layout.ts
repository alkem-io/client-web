/**
 * CRD Layout Component Contracts
 *
 * These types define the prop interfaces for the CRD layout components.
 * Layout components live in src/crd/layouts/ and are purely presentational.
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
};

// --- User info for header ---

export type CrdUserInfo = {
  name: string;
  avatarUrl?: string;
  initials: string;
};

// --- Header ---

export type CrdHeaderProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  onLogout?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

// --- Footer ---

export type CrdFooterProps = {
  className?: string;
};

// --- CrdLayout (full-page shell) ---

export type CrdLayoutProps = {
  user?: CrdUserInfo;
  authenticated: boolean;
  navigationHrefs: CrdNavigationHrefs;
  onLogout?: () => void;
  children: React.ReactNode;
};
