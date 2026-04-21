import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ContributionGridProps = {
  children: ReactNode;
  totalCount: number;
  collapsedRows?: number;
  className?: string;
};

export function ContributionGrid({ children, totalCount, collapsedRows = 2, className }: ContributionGridProps) {
  const { t } = useTranslation('crd-space');
  const [expanded, setExpanded] = useState(false);

  const itemsPerRow = 5; // Desktop: 5 cols
  const collapsedCount = collapsedRows * itemsPerRow;
  const shouldCollapse = totalCount > collapsedCount;

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3',
          !expanded && shouldCollapse && 'max-h-[280px] overflow-hidden'
        )}
      >
        {children}
      </div>

      {shouldCollapse && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                {t('callout.collapse')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                {t('callout.expand')} ({totalCount})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
