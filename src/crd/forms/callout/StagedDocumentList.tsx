import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '@/crd/lib/formatBytes';
import { Button } from '@/crd/primitives/button';

export type StagedDocumentItem = {
  key: string;
  name: string;
  size: number;
  status: 'staged' | 'importing' | 'failed';
  error?: string;
};

type StagedDocumentListProps = {
  items: StagedDocumentItem[];
  busy: boolean;
  onRemove: (key: string) => void;
};

/** The files staged for a multi-file document import, each with its status and a remove control. */
export function StagedDocumentList({ items, busy, onRemove }: StagedDocumentListProps) {
  const { t } = useTranslation('crd-space');

  return (
    <ul className="flex flex-col gap-2">
      {items.map(item => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-input-background px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-body-emphasis text-foreground truncate" title={item.name}>
              {item.name}
            </p>
            <p className="text-caption text-muted-foreground">{formatBytes(item.size)}</p>
            {item.status === 'importing' && (
              <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                {t('callout.documentImporting')}
              </p>
            )}
            {item.status === 'failed' && item.error && (
              <p role="alert" className="text-caption text-destructive">
                {item.error}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-full text-muted-foreground"
            onClick={() => onRemove(item.key)}
            disabled={busy}
            aria-label={t('callout.documentImportRemoveFile')}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
