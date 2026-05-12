import { ShieldAlert } from 'lucide-react';

import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type CrdAuthRequiredPageProps = {
  title: string;
  description: string;
  descriptionContinued: string;
  signInLabel: string;
  orLabel: string;
  returnAsGuestLabel: string;
  signInHref: string;
  returnAsGuestHref: string;
  className?: string;
};

export function CrdAuthRequiredPage({
  title,
  description,
  descriptionContinued,
  signInLabel,
  orLabel,
  returnAsGuestLabel,
  signInHref,
  returnAsGuestHref,
  className,
}: CrdAuthRequiredPageProps) {
  return (
    <div className={cn('flex min-h-[60vh] w-full items-center justify-center px-4 py-12', className)}>
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8 text-center shadow-sm">
        <ShieldAlert aria-hidden="true" className="size-12 text-muted-foreground" />
        <h1 className="text-page-title text-foreground">{title}</h1>
        <div className="flex flex-col gap-2">
          <p className="text-body text-muted-foreground">{description}</p>
          <p className="text-body text-muted-foreground">{descriptionContinued}</p>
        </div>
        <div className="flex w-full flex-col items-center gap-3">
          <Button asChild={true} className="w-full">
            <a href={signInHref}>{signInLabel}</a>
          </Button>
          <span className="text-caption text-muted-foreground">{orLabel}</span>
          <Button asChild={true} className="w-full" variant="outline">
            <a href={returnAsGuestHref}>{returnAsGuestLabel}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
