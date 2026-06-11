import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type TransferSectionLayoutProps = {
  /** Prominent destructive-operation warning shown at the top. */
  warning: string;
  children: ReactNode;
  className?: string;
};

/**
 * Layout shell for the Transfer & Conversions admin section — a prominent
 * destructive warning banner above the operation groups. Pure presentation.
 */
export function TransferSectionLayout({ warning, children, className }: TransferSectionLayoutProps) {
  return (
    <div className={cn('flex flex-col gap-6 rounded-lg border-2 border-destructive p-4', className)}>
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
        <p className="text-subheader font-semibold">{warning}</p>
      </div>
      {children}
    </div>
  );
}

/** A titled group of transfer/conversion operations. */
export function TransferGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-section-title">{title}</h2>
      {children}
    </section>
  );
}
