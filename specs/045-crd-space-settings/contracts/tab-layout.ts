import type { SaveBarState } from './shell';

export type LayoutColumnId = 'home' | 'community' | 'subspaces' | 'knowledge';

export type LayoutPageRow = {
  id: string;
  name: string;
  kind: 'system' | 'callout';
  icon: string;
};

export type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;
  pages: LayoutPageRow[];
};

export type LayoutReorderTarget = {
  columnId: LayoutColumnId;
  index: number;
};

export type LayoutViewProps = {
  columns: [LayoutPoolColumn, LayoutPoolColumn, LayoutPoolColumn, LayoutPoolColumn];
  saveBar: SaveBarState;
  onReorder: (pageId: string, target: LayoutReorderTarget) => void;
  onRename: (pageId: string, newName: string) => void;
  onAdd: (columnId: LayoutColumnId, name: string) => void;
  onRemove: (pageId: string) => void;
  onSave: () => void;
  onReset: () => void;
};
