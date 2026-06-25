import { FileSpreadsheet, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

/**
 * A search result backed by a Collabora office document. Rendered as a STANDARD
 * search card — indistinguishable from a title/description match (FR-013, US3):
 * it shows NO excerpt of the matched document text and NO indicator that the
 * match originated from document content. A single click opens the document /
 * its Collabora editor via `href` (one-action open).
 *
 * Mirrors the Memo/Whiteboard search cards. `parentPostTitle` is supplied only
 * for contribution-placed documents (`isContribution = true`) to show the owning
 * Post context, exactly like a contribution Response card.
 */
export type CollaboraDocumentResultCardData = {
  id: string;
  title: string;
  isContribution: boolean;
  author: { name: string; avatarUrl?: string };
  date: string;
  spaceName: string;
  parentPostTitle?: string;
  href: string;
};

type CollaboraDocumentResultCardProps = {
  document: CollaboraDocumentResultCardData;
  onClick: () => void;
};

export function CollaboraDocumentResultCard({ document, onClick }: CollaboraDocumentResultCardProps) {
  const { t } = useTranslation('crd-search');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={document.title}
      className={cn(
        'group block w-full text-left rounded-xl border bg-card overflow-hidden',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30',
        'transition-all duration-300 cursor-pointer'
      )}
    >
      <div className="p-4 flex flex-col gap-2.5">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={document.author.avatarUrl} alt="" />
            <AvatarFallback className="text-badge bg-secondary text-secondary-foreground">
              {document.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-caption font-medium text-card-foreground truncate">{document.author.name}</span>
          <span className="text-badge ml-auto text-muted-foreground">{document.date}</span>
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-card-title text-card-foreground group-hover:text-primary transition-colors duration-200">
          {document.title}
        </h4>

        {/* Parent context — only when this document is a contribution to a Post */}
        {document.isContribution && document.parentPostTitle && (
          <div className="border-t border-border pt-2 flex items-center gap-1.5">
            <MessageSquare aria-hidden="true" className="size-[11px] text-muted-foreground shrink-0" />
            <span className="text-caption text-muted-foreground truncate">
              {t('search.responseTo', { title: document.parentPostTitle })}
            </span>
          </div>
        )}

        {/* Footer — standard type badge + space context. No excerpt, no match-source indicator. */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-badge bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
            <FileSpreadsheet aria-hidden="true" className="size-3" />
            {t('search.postTypes.collaboraDocument')}
          </span>
          <span className="text-caption text-muted-foreground truncate">
            {t('search.spaceContext', { spaceName: document.spaceName })}
          </span>
        </div>
      </div>
    </button>
  );
}
