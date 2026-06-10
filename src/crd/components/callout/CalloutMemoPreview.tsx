import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';

type CalloutMemoPreviewProps = {
  content: string;
  onOpen: () => void;
  className?: string;
};

export function CalloutMemoPreview({ content, onOpen, className }: CalloutMemoPreviewProps) {
  const { t } = useTranslation('crd-space');

  // The whole preview is the click target (cursor-pointer everywhere), not just the footer label —
  // matching the contribution cards (which likewise nest CroppedMarkdown inside the button). The
  // "Open Memo" label is a non-interactive <span> so it doesn't nest a <button> inside this <button>.
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group block w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-muted/30 text-left transition-all hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <div className="p-4">
        <CroppedMarkdown content={content} maxHeight="16rem" />
      </div>
      <div className="border-t border-border bg-muted/20 group-hover:bg-primary/10 transition-colors px-4 py-2 flex justify-end">
        <span className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-sm h-8 px-3 text-control">
          {t('callout.openMemo')}
        </span>
      </div>
    </button>
  );
}
