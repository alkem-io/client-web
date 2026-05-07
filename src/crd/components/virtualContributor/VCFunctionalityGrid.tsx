import { Check, CircuitBoard, Minus, Upload, Users } from 'lucide-react';
import { Trans } from 'react-i18next';
import { Card, CardContent } from '@/crd/primitives/card';

export type BulletItem = {
  label: string;
  enabled: boolean;
};

export type VCFunctionalitySectionData = {
  capabilities: BulletItem[];
  dataAccess: BulletItem[];
  roleRequirements: { kind: 'memberRequired' | 'noneRequired' };
};

export type VCFunctionalityGridProps = {
  functionality: VCFunctionalitySectionData;
  labels: {
    heading: string;
    capabilitiesTitle: string;
    dataAccessTitle: string;
    roleRequirementsTitle: string;
    /** i18n KEY (passed straight to <Trans>) — contains <strong> markup. */
    roleRequirementsMemberRequiredKey: string;
    /** Plain string. */
    roleRequirementsNoneRequired: string;
  };
};

export function VCFunctionalityGrid({ functionality, labels }: VCFunctionalityGridProps) {
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
          {functionality.roleRequirements.kind === 'memberRequired' ? (
            <p className="text-body text-foreground">
              {/* i18nKey is a runtime-supplied key (mapper output) so the strict
                  literal-key type would reject it. Cast through `unknown` to
                  satisfy the typed-keys constraint while still resolving via i18next. */}
              <Trans
                // biome-ignore lint/suspicious/noExplicitAny: runtime-supplied i18n key
                i18nKey={labels.roleRequirementsMemberRequiredKey as any}
                components={{ strong: <strong /> }}
              />
            </p>
          ) : (
            <p className="text-body text-muted-foreground">{labels.roleRequirementsNoneRequired}</p>
          )}
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
