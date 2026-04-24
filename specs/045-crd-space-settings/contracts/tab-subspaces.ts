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
  onChangeDefaultTemplate: () => void;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
};
