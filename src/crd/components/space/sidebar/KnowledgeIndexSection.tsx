import { FileText, FolderOpen, Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type KnowledgeEntryType = 'text' | 'whiteboard';

export type KnowledgeEntry = {
  id: string;
  title: string;
  type: KnowledgeEntryType;
  /** Link to the callout — opens its detail dialog. */
  href?: string;
};

type KnowledgeIndexSectionProps = {
  entries: KnowledgeEntry[];
  /**
   * Plain left-click of an entry. The consumer handles navigation (SPA routing
   * that opens the callout detail dialog). Modified clicks fall through to the
   * native `href` so "open in new tab" still works.
   */
  onEntryClick?: (id: string) => void;
  className?: string;
};

const TYPE_ICONS: Record<KnowledgeEntryType, typeof FileText> = {
  text: FileText,
  whiteboard: Presentation,
};

/**
 * Sidebar index of the Knowledge Base callouts — a compact navigable list.
 * Each entry links to its callout's detail dialog.
 */
export function KnowledgeIndexSection({ entries, onEntryClick, className }: KnowledgeIndexSectionProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase text-sidebar-label text-muted-foreground">{t('sidebar.postIndex')}</h3>
      </div>
      <ul className="space-y-0.5 list-none p-0 m-0">
        {entries.map(entry => {
          const TypeIcon = TYPE_ICONS[entry.type] ?? FileText;
          return (
            <li key={entry.id}>
              <a
                href={entry.href}
                onClick={event => {
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }
                  event.preventDefault();
                  onEntryClick?.(entry.id);
                }}
                className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-md hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <TypeIcon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0',
                    entry.type === 'whiteboard' ? 'text-chart-2' : 'text-muted-foreground'
                  )}
                  aria-hidden="true"
                />
                <span className="line-clamp-1 text-body-emphasis text-foreground">{entry.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
