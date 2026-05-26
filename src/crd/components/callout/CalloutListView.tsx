import { FileText, Presentation } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type CalloutListItemType = 'text' | 'whiteboard';

export type CalloutListItem = {
  id: string;
  title: string;
  type: CalloutListItemType;
  /** Link to the callout's page. */
  href?: string;
  /**
   * Pre-formatted response summary shown in brackets after the title
   * (e.g. "2 memos", "4 whiteboards"). Already translated by the consumer.
   */
  meta?: string;
};

type CalloutListViewProps = {
  items: CalloutListItem[];
  /**
   * Invoked on a plain left-click of a row. The consumer handles navigation
   * (e.g. SPA routing). Modified clicks (cmd/ctrl/shift) and right-clicks fall
   * through to the native `href` so "open in new tab" keeps working.
   */
  onItemClick?: (id: string) => void;
  className?: string;
};

const TYPE_ICONS: Record<CalloutListItemType, typeof FileText> = {
  text: FileText,
  whiteboard: Presentation,
};

/**
 * Compact two-column list rendering of callouts — the alternative to the card
 * grid on the Knowledge Base tab. Each row is a link showing a type icon, the
 * title, and an optional bracketed response summary.
 */
export function CalloutListView({ items, onItemClick, className }: CalloutListViewProps) {
  return (
    <ul className={cn('grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5 list-none p-0 m-0', className)}>
      {items.map(item => {
        const TypeIcon = TYPE_ICONS[item.type] ?? FileText;
        return (
          <li key={item.id}>
            <a
              href={item.href}
              onClick={event => {
                // Without a custom handler, fall through to native `href` navigation.
                if (
                  !onItemClick ||
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
                onItemClick(item.id);
              }}
              className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-md hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <TypeIcon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="line-clamp-1 text-body-emphasis text-foreground flex-1 min-w-0">{item.title}</span>
              {item.meta && <span className="shrink-0 text-caption text-muted-foreground">({item.meta})</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
