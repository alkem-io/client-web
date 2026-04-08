import type { ReactNode } from 'react';

type PendingMembershipsSectionProps = {
  title: string;
  children: ReactNode;
};

function PendingMembershipsSection({ title, children }: PendingMembershipsSectionProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

export { PendingMembershipsSection };
export type { PendingMembershipsSectionProps };
