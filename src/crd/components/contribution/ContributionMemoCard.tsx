import { FileSignature, StickyNote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';

type ContributionMemoCardProps = {
  title: string;
  /** Raw markdown content for preview */
  markdownContent?: string;
  author?: string;
  onClick?: () => void;
  signedCopiesCount?: number;
  onOpenSignedCopies?: () => void;
  className?: string;
};

export function ContributionMemoCard({
  title,
  markdownContent,
  author,
  onClick,
  signedCopiesCount = 0,
  onOpenSignedCopies,
  className,
}: ContributionMemoCardProps) {
  const { t } = useTranslation('crd-space');
  const openMemoLabel = t('callout.openMemo');
  const openMemoAriaLabel = t('callout.openAria', { title });
  const signedCopiesLabel = t('memo.signing.signedCopiesCount', {
    count: signedCopiesCount,
  });

  return (
    <div
      className={cn(
        'group/memo relative w-full rounded-lg overflow-hidden border border-border bg-card min-h-[180px] hover:ring-2 hover:ring-primary/50 transition-all',
        className
      )}
    >
      <button
        type="button"
        aria-label={openMemoAriaLabel}
        className="absolute inset-0 z-0 w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={onClick}
      />
      <div className="pointer-events-none w-full h-full p-4">
        {markdownContent ? (
          <CroppedMarkdown content={markdownContent} maxHeight="180px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <StickyNote className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Hover "Open Memo" button overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover/memo:opacity-100 transition-opacity duration-200 bg-primary/40">
        <span className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-lg h-8 px-3 text-caption font-semibold">
          {openMemoLabel}
        </span>
      </div>

      {/* Title/author gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-3 flex flex-col justify-end pointer-events-none">
        <p className="text-white text-caption font-semibold truncate">{title}</p>
        {author && <p className="text-white/70 text-badge truncate">{author}</p>}
      </div>
      {signedCopiesCount > 0 && onOpenSignedCopies && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute right-3 top-3 z-10 shadow-sm"
          onClick={onOpenSignedCopies}
        >
          <FileSignature aria-hidden="true" />
          {signedCopiesLabel}
        </Button>
      )}
    </div>
  );
}
