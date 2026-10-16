import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/crd/primitives/collapsible';

export type SettingsSectionIconColor = 'primary' | 'purple' | 'orange' | 'green' | 'blue' | 'rose' | 'amber';

const ICON_COLORS: Record<SettingsSectionIconColor, string> = {
  primary: 'bg-primary/10 text-primary',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
};

type SettingsSectionProps = {
  title: string;
  description?: string;
  /** Decorative icon rendered inside the coloured tile. */
  icon?: ReactNode;
  iconColor?: SettingsSectionIconColor;
  defaultOpen?: boolean;
  /** Rendered right after the title — e.g. a count badge. */
  badge?: ReactNode;
  /**
   * When true (default) the body stays mounted while collapsed so editors keep
   * their state. Pass false to mount the body only while open — for sections
   * whose content is expensive and starts collapsed.
   */
  keepMounted?: boolean;
  /** False renders a fixed section: no chevron, always open (e.g. an action-only section). */
  collapsible?: boolean;
  /** Anchor id for deep links / scroll targets. */
  id?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Collapsible settings section card: coloured icon tile + title + chevron
 * header, body below. Collapsing is purely visual — by default the body stays
 * mounted (hidden) so editors inside keep their local state; `keepMounted={false}`
 * mounts it only while open.
 */
export function SettingsSection({
  title,
  description,
  icon,
  iconColor = 'primary',
  defaultOpen = true,
  badge,
  keepMounted = true,
  collapsible = true,
  id,
  children,
  className,
}: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const heading = (
    <>
      {icon && (
        <span
          aria-hidden="true"
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', ICON_COLORS[iconColor])}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-subsection-title">{title}</span>
          {badge}
        </span>
        {description && <span className="mt-0.5 block text-body text-muted-foreground">{description}</span>}
      </span>
    </>
  );

  if (!collapsible) {
    return (
      <section id={id} className={cn('scroll-mt-32 rounded-lg border bg-card', className)}>
        <h3 className="flex items-center gap-3 px-6 py-5">{heading}</h3>
        <div className="px-6 pb-6">{children}</div>
      </section>
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      id={id}
      className={cn('scroll-mt-32 rounded-lg border bg-card', className)}
    >
      <h3>
        <CollapsibleTrigger
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-6 py-5 text-left cursor-pointer transition-colors hover:bg-muted/30',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
          )}
        >
          {heading}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>
      </h3>
      <CollapsibleContent forceMount={keepMounted || undefined} className="data-[state=closed]:hidden">
        <div className="px-6 pb-6">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
