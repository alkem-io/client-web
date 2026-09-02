/**
 * Contract: CRD Admin Shell + section navigation.
 *
 * Presentational component in `src/crd/components/admin/AdminShell.tsx`.
 * Pure: no MUI, no Apollo, no routing — all data/behavior via props.
 * Reuses `SettingsTabStrip` for the horizontal section navigation.
 */
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type AdminSectionId =
  | 'spaces'
  | 'users'
  | 'organizations'
  | 'innovation-packs'
  | 'innovation-hubs'
  | 'virtual-contributors'
  | 'authorization'
  | 'authorization-policies'
  | 'transfer'
  | 'layout';

/** One entry per admin section — config-driven nav (twin of MUI `adminTabs`). */
export type AdminSectionDescriptor = {
  id: AdminSectionId;
  label: string; // already-translated label (consumer resolves crd-admin key)
  icon: LucideIcon;
};

export type AdminShellProps = {
  /** Translated page title, e.g. "Administration". */
  title: string;
  /** Sections, in MUI order. Order MUST match MUI `adminTabs`. */
  sections: ReadonlyArray<AdminSectionDescriptor>;
  /** Currently active section (derived from URL by the consumer). */
  activeSection: AdminSectionId;
  /** Fired when a section tab is chosen — consumer navigates. */
  onSectionChange: (next: AdminSectionId) => void;
  /** Active section body. */
  children: ReactNode;
  className?: string;
};
