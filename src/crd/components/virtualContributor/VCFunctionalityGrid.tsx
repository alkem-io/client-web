import { Check, CircuitBoard, Minus, Upload, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/crd/primitives/card';

export type BulletItem = {
  label: string;
  enabled: boolean;
};

export type VCFunctionalitySectionData = {
  capabilities: BulletItem[];
  dataAccess: BulletItem[];
  /** Discriminator only — the integration layer maps it to `roleRequirementsContent`. */
  roleRequirements: { kind: 'memberRequired' | 'noneRequired' };
};

export type VCFunctionalityGridProps = {
  functionality: VCFunctionalitySectionData;
  /**
   * Pre-rendered Role Requirements paragraph. The page constructs this with
   * `<Trans>` (the `memberRequired` copy contains `<strong>` markup) so the
   * CRD component never touches i18n keys directly.
   */
  roleRequirementsContent: ReactNode;
  labels: {
    heading: string;
    capabilitiesTitle: string;
    dataAccessTitle: string;
    roleRequirementsTitle: string;
  };
};

export function VCFunctionalityGrid({ functionality, roleRequirementsContent, labels }: VCFunctionalityGridProps) {
  return (
    <section>
      <h2 className="text-section-title mb-4">{labels.heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BulletCard icon={CircuitBoard} title={labels.capabilitiesTitle}>
          <BulletList items={functionality.capabilities} />
        </BulletCard>
        <BulletCard icon={Upload} title={labels.dataAccessTitle}>
          <BulletList items={functionality.dataAccess} />
        </BulletCard>
        <BulletCard icon={Users} title={labels.roleRequirementsTitle}>
          {roleRequirementsContent}
        </BulletCard>
      </div>
    </section>
  );
}

function BulletCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: 'true' | 'false' }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 px-6 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Icon className="size-5 text-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-card-title">{title}</h3>
        </div>
        <div className="flex-1 text-left">{children}</div>
      </CardContent>
    </Card>
  );
}

function BulletList({ items }: { items: BulletItem[] }) {
  if (items.length === 0) return null;
  return (
    /* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */
    /* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */
    <ul role="list" className="space-y-2">
      {items.map(item => (
        <li key={item.label} className="flex items-start gap-2 text-body">
          {item.enabled ? (
            <Check className="size-4 mt-0.5 text-foreground shrink-0" aria-hidden="true" />
          ) : (
            <Minus className="size-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
          )}
          <span className={item.enabled ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
