import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { type SettingsTabDescriptor, SettingsTabStrip } from '@/crd/components/contributor/settings/SettingsTabStrip';
import { cn } from '@/crd/lib/utils';

export type AdminShellSection<TId extends string = string> = {
  id: TId;
  label: string;
  icon: LucideIcon;
};

type AdminShellProps<TId extends string> = {
  /** Translated page title (e.g. "Administration"). */
  title: string;
  /** Sections in MUI order; each row drives one tab. */
  sections: ReadonlyArray<AdminShellSection<TId>>;
  activeSection: TId;
  onSectionChange: (next: TId) => void;
  /** Active section body. */
  children: ReactNode;
  className?: string;
};

/**
 * Platform-wide admin shell — sticky title band + horizontal section tab
 * strip + body slot. The visual structure mirrors `SettingsShell` (sticky
 * `top-16` band below the CRD header, content centred in a 12-col grid) but
 * the header is a page title rather than an entity avatar, because the admin
 * is not scoped to a single contributor.
 *
 * Pure presentational: receives `sections`, `activeSection`, `onSectionChange`
 * as props; navigation and data live in the integration layer.
 */
export function AdminShell<TId extends string>({
  title,
  sections,
  activeSection,
  onSectionChange,
  children,
  className,
}: AdminShellProps<TId>) {
  const tabs: ReadonlyArray<SettingsTabDescriptor<TId>> = sections;

  return (
    <div className={cn('min-h-screen bg-background pb-12', className)}>
      <div className="sticky top-16 z-20 border-b border-border bg-card">
        <div className="px-6 pt-8 pb-0 md:px-8">
          <CenteredColumn>
            <h1 className="text-page-title mb-8 tracking-tight">{title}</h1>
            <SettingsTabStrip activeTab={activeSection} onTabChange={onSectionChange} tabs={tabs} />
          </CenteredColumn>
        </div>
      </div>
      <div className="px-6 py-8 md:px-8">
        <CenteredColumn>{children}</CenteredColumn>
      </div>
    </div>
  );
}

function CenteredColumn({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-10 lg:col-start-2">{children}</div>
    </div>
  );
}
