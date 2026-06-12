/**
 * Public types for SpaceSettingsLayoutView. Plain TypeScript — no GraphQL
 * types, no Apollo imports. Consumed by the Layout mapper + data hook in
 * src/main/crdPages/topLevelPages/spaceSettings/layout/.
 */

export type LayoutColumnId = string;

export type LayoutCallout = {
  id: string;
  title: string;
  description: string;
  flowStateTagsetId: string;
  /** Canonical post URL (callout `profile.url`). Empty when unavailable — "View post" is hidden in that case. */
  profileUrl: string;
};

export type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;
  isCurrentPhase: boolean;
  /**
   * Whether this phase is hidden from the member-facing navigation. UI-only — never
   * affects authorization or content access (anyone with a direct URL still reaches it).
   * `undefined` when the platform does not yet expose the per-phase `visible` flag, in
   * which case the Hide/Show affordance is suppressed (graceful degradation).
   */
  isHidden?: boolean;
  callouts: LayoutCallout[];
};

export type LayoutReorderTarget = {
  columnId: LayoutColumnId;
  index: number;
};

export type LayoutSaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };

export type ColumnMenuActions = {
  onChangeActivePhase: (columnId: LayoutColumnId) => void;
  /** Set (templateId) or clear (null) this flow state's default Callout template. Fires the mutation immediately. */
  onSetAsDefaultCalloutTemplate: (columnId: LayoutColumnId, templateId: string | null) => void;
  /** Open the shared template picker (Callout templates) to choose this flow state's default — the consumer hosts it. */
  onOpenDefaultCalloutTemplatePicker: (columnId: LayoutColumnId) => void;
  /** Fires mutation immediately — saves title + description to backend, cascades rename to callouts. */
  onSaveColumnDetails: (columnId: LayoutColumnId, title: string, description: string) => Promise<void>;
  /**
   * Phase delete (immediate-save). Only present when phase management is enabled
   * (subspaces) AND removing this phase would not violate the flow's min-states
   * limit. Consumers MUST hide the menu entry when undefined.
   */
  onDeletePhase?: (columnId: LayoutColumnId) => Promise<void>;
  /**
   * Toggle a phase's visibility in the member-facing menu (immediate-save). UI-only:
   * never changes content access. `nextHidden = true` hides the phase, `false` shows it.
   * Only present when the platform exposes the per-phase `visible` flag; consumers MUST
   * hide the Hide/Show menu entry (and the "Hidden" badge) when undefined.
   */
  onToggleVisibility?: (columnId: LayoutColumnId, nextHidden: boolean) => Promise<void>;
};

export type LayoutPostDescriptionDisplay = 'collapsed' | 'expanded';
