import { FileText, LayoutGrid, LinkIcon, Presentation, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type CalloutSidebarItem = {
  id: string;
  title: string;
  type: 'text' | 'whiteboard' | 'collection' | 'link' | 'poll' | 'media';
};

type CalloutSidebarListProps = {
  items: CalloutSidebarItem[];
  onItemClick?: (id: string) => void;
  className?: string;
};

const typeIcons: Record<string, typeof FileText> = {
  text: FileText,
  whiteboard: Presentation,
  collection: LayoutGrid,
  link: LinkIcon,
  poll: FileText,
  media: LayoutGrid,
};

export function CalloutSidebarList({ items, onItemClick, className }: CalloutSidebarListProps) {
  const { t } = useTranslation('crd-space');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search input */}
      {items.length > 3 && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t('members.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label={t('members.search')}
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
        {filtered.map(item => {
          const TypeIcon = typeIcons[item.type] ?? FileText;
          return (
            <button
              key={item.id}
              type="button"
              className="group flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => onItemClick?.(item.id)}
            >
              <TypeIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
