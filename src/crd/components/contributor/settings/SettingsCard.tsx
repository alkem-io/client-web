import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/crd/primitives/card';

type SettingsCardProps = {
  /** Optional lucide icon rendered in primary colour to the left of the title. */
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned slot in the title row (e.g., a status badge). */
  titleAccessory?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Wrapper card primitive used by every per-tab content block. Mirrors the
 * 045 SpaceSettingsCard but accepts an optional leading icon (for Identity /
 * About You / Social Links section headers in the User Profile tab).
 */
export function SettingsCard({
  icon: Icon,
  title,
  description,
  titleAccessory,
  children,
  className,
}: SettingsCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" /> : null}
            <div className="flex-1">
              <CardTitle>{title}</CardTitle>
              {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
            </div>
          </div>
          {titleAccessory ? <div className="shrink-0">{titleAccessory}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
