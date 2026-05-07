import type { ReactNode } from 'react';
import { Separator } from '@/crd/primitives/separator';

export type VCMonitoringSectionProps = {
  heading: string;
  /**
   * Pre-rendered body. The integration layer composes this with `<Trans>` so
   * the CRD component stays presentational and never resolves i18n keys or
   * deployment-specific URLs (e.g., the Alkemio T&C link).
   */
  body: ReactNode;
};

export function VCMonitoringSection({ heading, body }: VCMonitoringSectionProps) {
  return (
    <section className="space-y-4">
      <Separator />
      <h2 className="text-section-title">{heading}</h2>
      <div className="text-body text-muted-foreground">{body}</div>
    </section>
  );
}
