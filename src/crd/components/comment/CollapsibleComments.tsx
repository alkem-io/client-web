import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CollapsibleCommentsProps = {
  children: ReactNode;
  className?: string;
};

const COLLAPSED_HEIGHT = 250;

export function CollapsibleComments({ children, className }: CollapsibleCommentsProps) {
  const { t } = useTranslation('crd-space');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    setCanToggle(content.scrollHeight > COLLAPSED_HEIGHT);
  }, [children]);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        ref={contentRef}
        className={cn('overflow-hidden', !expanded && canToggle && 'max-h-[250px]')}
        style={!expanded && canToggle ? { maxHeight: `${COLLAPSED_HEIGHT}px` } : undefined}
      >
        {children}
      </div>

      {canToggle && (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setExpanded(current => !current)}>
          {expanded ? t('comments.showLess') : t('comments.showMore')}
        </Button>
      )}
    </div>
  );
}
