import { FileText, FolderOpen, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Input } from '@/crd/primitives/input';

type KnowledgeEntry = {
  id: string;
  title: string;
  type: 'text' | 'collection';
  description?: string;
  tags?: string[];
};

type KnowledgeIndexSectionProps = {
  entries: KnowledgeEntry[];
  onEntryClick?: (id: string) => void;
  className?: string;
};

export function KnowledgeIndexSection({ entries, onEntryClick, className }: KnowledgeIndexSectionProps) {
  const { t } = useTranslation('crd-space');
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const filteredEntries =
    trimmed.length > 0
      ? entries.filter(entry => {
          const haystack = [entry.title, entry.description ?? '', ...(entry.tags ?? [])].join(' ').toLowerCase();
          return haystack.includes(trimmed);
        })
      : entries;

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.postIndex')}</h3>
      </div>
      <div className="relative mb-2">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={t('sidebar.searchPlaceholder')}
          aria-label={t('sidebar.searchLabel')}
          className="pl-8 h-8 text-control"
        />
      </div>
      <div className="space-y-0.5">
        {filteredEntries.map(entry => (
          <button
            key={entry.id}
            type="button"
            className="group flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onEntryClick?.(entry.id)}
          >
            <FileText
              className={cn(
                'w-3.5 h-3.5 shrink-0',
                entry.type === 'collection' ? 'text-chart-2' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            <span className="line-clamp-1 text-body-emphasis text-foreground">{entry.title}</span>
          </button>
        ))}
        {filteredEntries.length === 0 && trimmed.length > 0 && (
          <p className="px-3 py-2 text-caption text-muted-foreground">{t('sidebar.noResults')}</p>
        )}
      </div>
    </div>
  );
}
