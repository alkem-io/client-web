import { ChevronDown, ChevronRight, ExternalLink, File, Folder, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type DocumentFile = {
  id: string;
  kind: 'file';
  name: string;
  sizeFormatted: string;
  uploaderName: string;
  uploaderHref: string;
  uploadedAt: string;
  openHref: string;
  canDelete: boolean;
};

export type DocumentFolder = {
  id: string;
  kind: 'folder';
  name: string;
  children: DocumentNode[];
};

export type DocumentNode = DocumentFolder | DocumentFile;

export type SpaceSettingsStorageViewProps = {
  tree: DocumentNode[];
  expandedFolderIds: ReadonlySet<string>;
  loading?: boolean;
  onToggleFolder: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  className?: string;
};

export function SpaceSettingsStorageView({
  tree,
  expandedFolderIds,
  loading,
  onToggleFolder,
  onDelete,
  className,
}: SpaceSettingsStorageViewProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const rows = flattenTree(tree, expandedFolderIds, 0);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <h2 className="text-page-title">{t('storage.pageHeader.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('storage.pageHeader.subtitle')}</p>
      </div>

      {loading ? (
        <StorageSkeletons />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('storage.empty')}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('storage.columns.name')}</TableHead>
              <TableHead className="w-[100px]">{t('storage.columns.size')}</TableHead>
              <TableHead className="w-[150px]">{t('storage.columns.uploader')}</TableHead>
              <TableHead className="w-[150px]">{t('storage.columns.date')}</TableHead>
              <TableHead className="w-[80px]">{t('storage.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <StorageRow
                key={row.node.id}
                node={row.node}
                depth={row.depth}
                isExpanded={row.node.kind === 'folder' && expandedFolderIds.has(row.node.id)}
                onToggle={() => {
                  if (row.node.kind === 'folder') onToggleFolder(row.node.id);
                }}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

type FlatRow = { node: DocumentNode; depth: number };

function flattenTree(nodes: DocumentNode[], expandedIds: ReadonlySet<string>, depth: number): FlatRow[] {
  const result: FlatRow[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.kind === 'folder' && expandedIds.has(node.id)) {
      result.push(...flattenTree(node.children, expandedIds, depth + 1));
    }
  }
  return result;
}

function StorageRow({
  node,
  depth,
  isExpanded,
  onToggle,
  onDelete,
}: {
  node: DocumentNode;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string, name: string) => void;
}) {
  const { t } = useTranslation('crd-spaceSettings');

  if (node.kind === 'folder') {
    return (
      <TableRow>
        <TableCell>
          <button
            type="button"
            className="flex items-center gap-1.5 text-body-emphasis hover:underline"
            style={{ paddingLeft: `${depth * 20}px` }}
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
            ) : (
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
            )}
            <Folder aria-hidden="true" className="size-3.5 text-muted-foreground shrink-0" />
            {node.name}
          </button>
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 20}px` }}>
          <File aria-hidden="true" className="size-3.5 text-muted-foreground shrink-0" />
          <a
            href={node.openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline truncate"
          >
            {node.name}
          </a>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{node.sizeFormatted}</TableCell>
      <TableCell>
        <a href={node.uploaderHref} className="text-sm hover:underline text-muted-foreground">
          {node.uploaderName}
        </a>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{node.uploadedAt}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <a
            href={node.openHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('storage.openInNewTab')}
            className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors"
          >
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
          {node.canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onDelete(node.id, node.name)}
              aria-label={t('storage.delete')}
            >
              <Trash2 aria-hidden="true" className="size-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function StorageSkeletons() {
  return (
    <div className="flex flex-col gap-1 animate-pulse">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <div className="size-4 rounded bg-muted" />
          <div className="h-3.5 flex-1 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
