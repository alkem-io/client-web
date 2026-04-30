export type SubspaceSortMode = 'alphabetical' | 'manual';
export type SubspaceFilter = 'all' | 'active' | 'archived';
export type SubspaceViewMode = 'grid' | 'list';

export type SubspaceTile = {
  id: string;
  name: string;
  description: string;
  /** Navigation target for title click. */
  href: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  memberCount: number;
  lastActiveAt: string | null;
  visibility: 'active' | 'archived';
  /** Only meaningful in alphabetical sort mode. */
  isPinned: boolean;
};

export type SubspaceDefaultTemplate = {
  id: string;
  name: string;
  description: string;
  features: string[];
  thumbnailUrl: string | null;
};

/**
 * Per-subspace kebab — exactly the current MUI actions.
 * "Edit Details", "Archive", and "View" are explicitly NOT included.
 */
export type SubspaceKebabAction = 'pinToggle' | 'saveAsTemplate' | 'delete';

export type SubspacesViewProps = {
  subspaces: SubspaceTile[];
  defaultTemplate: SubspaceDefaultTemplate;
  sortMode: SubspaceSortMode;
  searchQuery: string;
  filter: SubspaceFilter;
  viewMode: SubspaceViewMode;
  onSortModeChange: (next: SubspaceSortMode) => void;
  onSearchChange: (next: string) => void;
  onFilterChange: (next: SubspaceFilter) => void;
  onViewModeChange: (next: SubspaceViewMode) => void;
  onCreate: () => void;
  /**
   * Updated 2026-04-27. Optional — passed only at L0. When `undefined`, the
   * "Default Subspace Template" card MUST NOT render (template management is
   * L0-only per FR-036).
   */
  onChangeDefaultTemplate?: () => void;
  /**
   * Added 2026-04-27. The page wires `subspacesTab.canSaveAsTemplate && level === 'L0'`
   * so the kebab "Save as Template" entry is hidden at L1.
   */
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
};
