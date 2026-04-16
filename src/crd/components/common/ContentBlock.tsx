import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

export type ContentBlockProps = {
  title?: string;
  accent?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Generic content block with optional accent left border, title, and actions slot.
 */
export function ContentBlock({ title, accent = false, actions, children, className }: ContentBlockProps) {
  return (
    <div
      className={cn('rounded-lg bg-card border border-border p-5', accent && 'border-l-4 border-l-primary', className)}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-label uppercase text-muted-foreground">{title}</h3>}
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
