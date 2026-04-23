/**
 * Hierarchical document tree — retained from current MUI UX (FR-021).
 * The prototype's info-card-only view is NOT adopted (would be a regression).
 */

export type DocumentFolder = {
  id: string;
  kind: 'folder';
  name: string;
  children: DocumentNode[];
};

export type DocumentFile = {
  id: string;
  kind: 'file';
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploaderName: string;
  uploaderHref: string;
  /** ISO-8601 */
  uploadedAt: string;
  openInNewTabHref: string;
};

export type DocumentNode = DocumentFolder | DocumentFile;

export type StorageViewProps = {
  tree: DocumentNode[];
  expandedFolderIds: ReadonlySet<string>;
  onToggleFolder: (id: string) => void;
  onDelete: (id: string) => void;
};
