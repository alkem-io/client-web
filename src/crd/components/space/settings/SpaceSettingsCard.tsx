import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/crd/primitives/card';

/**
 * SpaceSettingsCard — per-field (or per-group) card primitive used by every
 * tab in the CRD Space Settings page.
 *
 * Renders a CRD `Card` with a title, optional inline description under the
 * title, an optional status/accessory slot on the right of the title row, and
 * the body content below.
 */
type SpaceSettingsCardProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned slot in the title row — e.g. per-field autosave indicator on About. */
  titleAccessory?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SpaceSettingsCard({ title, description, titleAccessory, children, className }: SpaceSettingsCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
          {titleAccessory ? <div className="shrink-0">{titleAccessory}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
