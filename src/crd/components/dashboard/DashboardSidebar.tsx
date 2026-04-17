import type { LucideIcon } from 'lucide-react';
import { History, Lightbulb, Mail, PenLine, Rocket, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Switch } from '@/crd/primitives/switch';
import type { SidebarResourceData } from './SidebarResourceItem';
import { SidebarResourceItem } from './SidebarResourceItem';

export type SidebarMenuItemData = {
  id: string;
  label: string;
  iconName: string;
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
};

export type SidebarResourceSection = {
  title: string;
  items: SidebarResourceData[];
};

const iconMap: Record<string, LucideIcon> = {
  Mail,
  PenLine,
  History,
  Lightbulb,
  Tag,
  Rocket,
};

type DashboardSidebarProps = {
  menuItems: SidebarMenuItemData[];
  resourceSections: SidebarResourceSection[];
  activityEnabled?: boolean;
  onActivityToggle?: (enabled: boolean) => void;
  showActivityToggle?: boolean;
  className?: string;
};

export function DashboardSidebar({
  menuItems,
  resourceSections,
  activityEnabled = false,
  onActivityToggle,
  showActivityToggle = true,
  className,
}: DashboardSidebarProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-1">
        {menuItems.map(item => {
          const Icon = iconMap[item.iconName];
          const content = (
            <>
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span className="truncate">{item.label}</span>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <Badge variant="secondary" className="ml-auto text-badge px-1.5 py-0">
                  {item.badgeCount}
                </Badge>
              )}
            </>
          );

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-body hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={
                  item.badgeCount
                    ? `${item.label}, ${t('sidebar.pendingCount', { count: item.badgeCount })}`
                    : undefined
                }
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-body hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none w-full text-left"
              aria-label={
                item.badgeCount ? `${item.label}, ${t('sidebar.pendingCount', { count: item.badgeCount })}` : undefined
              }
            >
              {content}
            </button>
          );
        })}
      </div>

      {showActivityToggle && onActivityToggle && (
        <div className="flex items-center gap-2 px-2">
          <Switch id="activity-view-toggle" checked={activityEnabled} onCheckedChange={onActivityToggle} />
          <label htmlFor="activity-view-toggle" className="text-body cursor-pointer">
            {t('sidebar.activityView')}
          </label>
        </div>
      )}

      {resourceSections.map(section => (
        <section key={section.title} aria-label={section.title} className="space-y-1">
          <h4 className="px-2 text-label uppercase text-muted-foreground">{section.title}</h4>
          <ul className="space-y-0.5">
            {section.items.map(item => (
              <li key={item.id}>
                <SidebarResourceItem {...item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
