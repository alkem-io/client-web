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
  onSetAsDefaultPostTemplate: (columnId: LayoutColumnId, templateId: string | null) => void;
  /** Fires mutation immediately — saves title + description to backend, cascades rename to callouts. */
  onSaveColumnDetails: (columnId: LayoutColumnId, title: string, description: string) => Promise<void>;
  availablePostTemplates: ReadonlyArray<{ id: string; label: string }>;
};

export type LayoutPostDescriptionDisplay = 'collapsed' | 'expanded';
