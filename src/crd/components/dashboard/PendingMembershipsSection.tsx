import type { ReactNode } from 'react';

type PendingMembershipsSectionProps = {
  title: string;
  children: ReactNode;
};

function PendingMembershipsSection({ title, children }: PendingMembershipsSectionProps) {
  return (
    <section>
      <h3 className="text-card-title text-muted-foreground mb-2">{title}</h3>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" className="space-y-2">
        {children}
      </ul>
    </section>
  );
}

export { PendingMembershipsSection };
export type { PendingMembershipsSectionProps };
