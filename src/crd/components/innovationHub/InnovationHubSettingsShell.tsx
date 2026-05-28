import { Eye, FoldHorizontal, Info, Layers, UnfoldHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { HubSettingsHeaderThumbnail } from './HubSettingsHeaderThumbnail';

export type HubSettingsTabKey = 'about' | 'spaces';

export type HubSettingsHeaderData = {
  name: string;
  tagline: string;
  bannerImageUrl?: string;
  thumbnailColor: string;
  initials: string;
  viewHubUrl: string;
};

export type InnovationHubSettingsShellProps = {
  header: HubSettingsHeaderData;
  activeTab: HubSettingsTabKey;
  tabHrefs: Record<HubSettingsTabKey, string>;
  children: ReactNode;
  /**
   * Mirrors the Spaces "Wide layout" toggle. When `true`, the sticky header and
   * the body band fill all 12 grid columns. When `false`, both sit in the
   * centered `col-start-2 col-span-10` inset.
   */
  fullWidth?: boolean;
  /**
   * When provided, renders the expand/collapse toggle next to the view-hub
   * icon. Omit to hide the toggle entirely.
   */
  onToggleFullWidth?: () => void;
};

const tabs: { key: HubSettingsTabKey; icon: typeof Info; labelKey: string }[] = [
  { key: 'about', icon: Info, labelKey: 'settings.tabs.about' },
  { key: 'spaces', icon: Layers, labelKey: 'settings.tabs.spaces' },
];

export const InnovationHubSettingsShell = ({
  header,
  activeTab,
  tabHrefs,
  children,
  fullWidth = false,
  onToggleFullWidth,
}: InnovationHubSettingsShellProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const bandClass = contentColumnClass(fullWidth);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky header with hub identity + tab strip */}
      <div className="sticky top-16 z-20 border-b border-border bg-card">
        <div className="px-6 pt-8 pb-0 md:px-8">
          <div className="grid grid-cols-12 gap-6">
            <div className={cn('col-span-12', bandClass)}>
              <div className="mb-8 flex items-center gap-4">
                <HubSettingsHeaderThumbnail
                  imageUrl={header.bannerImageUrl}
                  color={header.thumbnailColor}
                  initials={header.initials}
                  alt={header.name}
                />
                <div className="flex-1">
                  <h1 className="text-page-title">{header.name}</h1>
                  {header.tagline && <p className="text-body mt-0.5 text-muted-foreground">{header.tagline}</p>}
                </div>
                {onToggleFullWidth && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 lg:inline-flex"
                    onClick={onToggleFullWidth}
                    aria-pressed={fullWidth}
                    aria-label={fullWidth ? t('settings.header.collapseWidth') : t('settings.header.expandWidth')}
                  >
                    {fullWidth ? (
                      <FoldHorizontal className="size-4" aria-hidden="true" />
                    ) : (
                      <UnfoldHorizontal className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                )}
                <a
                  href={header.viewHubUrl}
                  className={cn(
                    'rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                  )}
                  aria-label={t('settings.header.viewHubAria')}
                >
                  <Eye aria-hidden="true" className="size-4" />
                </a>
              </div>

              {/* These triggers are navigation links (each `<a>` has its own `href`),
                  not in-page Radix tabs — so the right a11y model is a `<nav>` landmark
                  with `aria-current="page"` on the active link, not `role="tablist"/"tab"`.
                  ARIA tab roles imply keyboard arrow-key panel-switching that doesn't apply here. */}
              <nav
                aria-label={t('settings.tabs.navAria')}
                className="no-scrollbar flex items-center gap-6 overflow-x-auto"
              >
                {tabs.map(item => {
                  const isActive = item.key === activeTab;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.key}
                      aria-current={isActive ? 'page' : undefined}
                      href={tabHrefs[item.key]}
                      className={cn(
                        'text-control flex items-center gap-2 whitespace-nowrap border-b-2 pb-4 transition-colors',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {t(item.labelKey as 'settings.tabs.about' | 'settings.tabs.spaces')}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="px-6 py-8 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12', bandClass)}>
            <div className="min-h-[500px] w-full rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
