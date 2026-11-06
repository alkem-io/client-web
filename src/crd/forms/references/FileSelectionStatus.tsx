import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LeftOutFile, LeftOutReason } from '@/crd/lib/fileSelection';
import { Button } from '@/crd/primitives/button';

type FileSelectionStatusProps = {
  pending: { key: string; name: string }[];
  leftOut: LeftOutFile[];
  onDismiss: () => void;
};

/** Progress of a multi-file selection (one line per file still uploading) and one notice naming
 *  every file the selection left out, with its reason. */
export function FileSelectionStatus({ pending, leftOut, onDismiss }: FileSelectionStatusProps) {
  const { t } = useTranslation('crd-common');

  if (pending.length === 0 && leftOut.length === 0) return null;

  const reasonText = (reason: LeftOutReason) => {
    switch (reason.kind) {
      case 'limit':
        return t('fileSelection.reason.limit');
      case 'type':
        return t('fileSelection.reason.type');
      case 'size':
        return t('fileSelection.reason.size', { maxMb: Math.ceil(reason.maxBytes / 1024 / 1024) });
      case 'failed':
        return t('fileSelection.reason.failed');
    }
  };

  return (
    <div className="space-y-2">
      {pending.length > 0 && (
        <output aria-label={t('fileSelection.uploading')} className="block">
          {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight strips the list semantics that this role restores */}
          {/* biome-ignore lint/a11y/useSemanticElements: the ul is already the semantic element */}
          <ul role="list" className="space-y-1">
            {pending.map(file => (
              <li key={file.key} className="flex items-center gap-2 text-caption text-muted-foreground">
                <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
                <span className="truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="shrink-0">{t('fileSelection.uploading')}</span>
              </li>
            ))}
          </ul>
        </output>
      )}
      {leftOut.length > 0 && (
        <output className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-body-emphasis text-destructive">
              {t('fileSelection.notAdded', { count: leftOut.length })}
            </p>
            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight strips the list semantics that this role restores */}
            {/* biome-ignore lint/a11y/useSemanticElements: the ul is already the semantic element */}
            <ul role="list" className="space-y-0.5">
              {leftOut.map((file, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: the same file name can be left out twice
                <li key={index} className="text-caption text-foreground break-words">
                  <span className="font-semibold">{file.name}</span>
                  {': '}
                  {reasonText(file.reason)}
                </li>
              ))}
            </ul>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={onDismiss}
            aria-label={t('fileSelection.dismiss')}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </output>
      )}
    </div>
  );
}
