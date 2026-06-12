import {
  ArrowLeftRight,
  Bot,
  Boxes,
  Building2,
  Globe,
  KeyRound,
  type LucideIcon,
  Package,
  ShieldCheck,
  Users,
} from 'lucide-react';

/**
 * Stable section identifiers for the CRD global admin.
 *
 * The ids double as the URL segment under `/admin/` and MUST match the MUI
 * `adminTabs[].route` segments (`src/domain/platformAdmin/layout/toplevel/constants.ts`)
 * one-to-one — including the cases where the MUI `AdminSection` enum *value*
 * differs from its URL segment (`virtualContributors` → `virtual-contributors`,
 * `authorizationPolicies` → `authorization-policies`). We use the URL segment as
 * the source of truth so deep links stay identical to the MUI admin.
 */
export const ADMIN_SECTION_IDS = [
  'spaces',
  'users',
  'organizations',
  'innovation-packs',
  'innovation-hubs',
  'virtual-contributors',
  'authorization',
  'authorization-policies',
  'transfer',
] as const;

export type AdminSectionId = (typeof ADMIN_SECTION_IDS)[number];

export type AdminSectionDescriptor = {
  id: AdminSectionId;
  /** Absolute admin URL — must match MUI `adminTabs[].route`. */
  path: string;
  icon: LucideIcon;
};

/** Section order is fixed to mirror MUI `adminTabs` exactly (FR-002). */
export const ADMIN_SECTIONS: readonly AdminSectionDescriptor[] = [
  { id: 'spaces', path: '/admin/spaces', icon: Boxes },
  { id: 'users', path: '/admin/users', icon: Users },
  { id: 'organizations', path: '/admin/organizations', icon: Building2 },
  { id: 'innovation-packs', path: '/admin/innovation-packs', icon: Package },
  { id: 'innovation-hubs', path: '/admin/innovation-hubs', icon: Globe },
  { id: 'virtual-contributors', path: '/admin/virtual-contributors', icon: Bot },
  { id: 'authorization', path: '/admin/authorization', icon: ShieldCheck },
  { id: 'authorization-policies', path: '/admin/authorization-policies', icon: KeyRound },
  { id: 'transfer', path: '/admin/transfer', icon: ArrowLeftRight },
];

export const isAdminSectionId = (value: string): value is AdminSectionId =>
  (ADMIN_SECTION_IDS as readonly string[]).includes(value);

export const DEFAULT_ADMIN_SECTION: AdminSectionId = 'spaces';
