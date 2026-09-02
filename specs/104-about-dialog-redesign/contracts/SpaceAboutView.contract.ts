/**
 * Component prop contract — About Dialog Redesign (feature 104).
 *
 * This is a CONTRACT REFERENCE, not the shipping source. It documents the
 * plain-TypeScript prop surface the redesigned CRD presentational components
 * MUST expose. The real implementation lives in:
 *   - src/crd/components/space/SpaceAboutView.tsx
 *   - src/crd/components/space/SpaceAboutDialog.tsx
 *
 * Constitution III / CRD Rule 4: props are plain TypeScript — NO GraphQL
 * generated types may appear here. All business text arrives as props; all
 * design-system labels come from the `crd-space` i18n namespace inside the
 * component. All behavior arrives as `on*` callbacks (CRD Rule 3).
 *
 * Backwards-compatibility rule for this feature: every prop that exists today
 * is retained with the SAME meaning so neither integration site
 * (CrdSpaceAbout, CrdSubspaceAbout) nor the standalone preview (SpacePage)
 * needs a forced change. New props are OPTIONAL only.
 */

import type { ReactNode } from 'react';

/** A space lead or host (person or organization). */
export type SpaceLeadData = {
  name: string;
  avatarUrl?: string;
  type: 'person' | 'organization';
  location?: string;
  /** Profile URL — always sourced from `profile.url` / urlBuilders (never inline-templated). */
  href: string;
};

/** A reference link shown in the References section. */
export type CalloutReference = {
  name: string;
  uri: string;
  description?: string;
};

/** Aggregate view-model rendered by the dialog body. Mirrors the existing type. */
export type SpaceAboutData = {
  name: string;
  tagline?: string;
  description?: string;
  location?: string;
  metrics: Array<{ name: string; value: string }>;
  who?: string;
  why?: string;
  provider?: SpaceLeadData;
  leadUsers: SpaceLeadData[];
  leadOrganizations: SpaceLeadData[];
  references: CalloutReference[];
};

/** Props for the redesigned dialog body. */
export type SpaceAboutViewContract = {
  data: SpaceAboutData;
  className?: string;

  /** Apply / Join CTA (FR-003/FR-004). Rendered only when the viewer can join. */
  joinSlot?: ReactNode;
  /** CommunityGuidelinesBlock from the integration layer (FR-006). */
  guidelinesSlot?: ReactNode;
  /** Host-contact affordance (FR-015) — current link behavior, restyled. */
  contactHostSlot?: ReactNode;

  /** Level-aware section headings (FR-014). */
  whyTitle?: string;
  whoTitle?: string;

  /** Member metric for the space-info panel (FR-002). */
  memberCount?: string;
  /** Drives the "already a member" indication (FR-004). */
  isMember?: boolean;

  /** Edit affordances — visible only with privilege (FR-005). Same destinations as today. */
  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;
  onEditMembers?: () => void;
};

/**
 * Prop signature is UNCHANGED from today's components. The redesign is a pure
 * re-skin: the prototype's dark-card "edit space profile" / "manage community"
 * icons reuse the EXISTING `onEditDescription` / `onEditMembers` callbacks
 * (same settings destinations). No new prop is added, and no integration site
 * (CrdSpaceAbout, CrdSubspaceAbout) changes.
 */

/** Props for the redesigned dialog shell (adds name+tagline header, R2). */
export type SpaceAboutDialogContract = SpaceAboutViewContract & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Private-space lock indicator pinned in the header (FR-008). */
  lockTooltipSlot?: ReactNode;
};

/**
 * Behavioral invariants the redesign MUST satisfy (checked in review / verify):
 *
 * 1. Visible title = data.name; tagline rendered beneath it (R2, FR-001).
 * 2. Header + close stay pinned; only the body scrolls; close always reachable
 *    (FR-009, SC-005) — flex column, shrink-0 header, flex-1 min-h-0 body.
 * 3. A section is omitted (no placeholder) when its data is absent AND the user
 *    cannot edit it (FR-011).
 * 4. Markdown fields render via a markdown renderer, never raw (FR-012).
 * 5. Missing avatarUrl → AvatarFallback (FR-013).
 * 6. Edit affordances appear only when hasEditPrivilege and navigate to the
 *    SAME settings destinations as the current dialog (FR-005).
 * 7. References open in a new tab without dismissing the dialog (FR-007).
 * 8. No @mui/* or @emotion/* imports; no GraphQL types; Tailwind + semantic
 *    typography tokens only; lucide-react icons; all labels via t('crd-space')
 *    (Constitution II/III/V, CRD golden rules).
 */
