import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type PageContentRibbonProps = {
  children: ReactNode;
  className?: string;
};

const PageContentRibbon = ({ children, className }: PageContentRibbonProps) => (
  <div
    className={cn(
      'flex items-center justify-center gap-2 bg-primary px-2 py-1.5 text-primary-foreground text-caption text-center',
      className
    )}
  >
    <p className="text-body">{children}</p>
  </div>
);

export default PageContentRibbon;
