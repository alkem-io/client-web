import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type CrdErrorPageProps = {
  title: string;
  description: ReactNode;
  reloadLabel: string;
  onReload: () => void;
  /** Optional support-contact affordance (e.g. a mailto link), rendered when provided. */
  contactSlot?: ReactNode;
  /** Optional numeric/code line shown under the description. */
  code?: string;
  /** Optional error details (e.g. a stack trace) shown in a scrollable block — dev only. */
  details?: string;
  className?: string;
};

export function CrdErrorPage({
  title,
  description,
  reloadLabel,
  onReload,
  contactSlot,
  code,
  details,
  className,
}: CrdErrorPageProps) {
  return (
    <div className={cn('flex min-h-[60vh] w-full items-center justify-center px-4 py-12', className)}>
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8 text-center shadow-sm">
        <TriangleAlert aria-hidden="true" className="size-12 text-muted-foreground" />
        <h1 className="text-page-title text-foreground">{title}</h1>
        <div className="text-body text-muted-foreground">{description}</div>
        {code && <p className="text-caption text-muted-foreground">{code}</p>}
        {contactSlot && <div className="text-body text-muted-foreground">{contactSlot}</div>}
        {details && (
          <pre className="max-h-48 w-full overflow-auto rounded-md bg-muted p-3 text-left text-caption text-muted-foreground">
            {details}
          </pre>
        )}
        <div className="flex w-full flex-col gap-2">
          <Button autoFocus={true} type="button" onClick={onReload}>
            {reloadLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
