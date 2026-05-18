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
};

export type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;
  isCurrentPhase: boolean;
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
};

export type LayoutPostDescriptionDisplay = 'collapsed' | 'expanded';
