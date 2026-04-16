import { FileText, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type KnowledgeEntry = {
  id: string;
  title: string;
  type: 'text' | 'collection';
};

type KnowledgeIndexSectionProps = {
  entries: KnowledgeEntry[];
  onEntryClick?: (id: string) => void;
  className?: string;
};

export function KnowledgeIndexSection({ entries, onEntryClick, className }: KnowledgeIndexSectionProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.postIndex')}</h3>
      </div>
      <div className="space-y-0.5">
        {entries.map(entry => (
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
            <span className="line-clamp-1 text-sm font-medium text-foreground">{entry.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
