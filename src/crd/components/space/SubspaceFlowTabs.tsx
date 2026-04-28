import { ChevronsRight, Layout, Menu, Plus } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/crd/primitives/sheet';

export type SubspaceFlowPhase = {
  id: string;
  label: string;
  description?: string;
};

export type SubspaceFlowTabsProps = {
  phases: SubspaceFlowPhase[];
  activePhaseId: string | undefined;
  onPhaseChange: (id: string) => void;
  canEditFlow?: boolean;
  canAddPost?: boolean;
  editFlowHref?: string;
  onEditFlowClick?: () => void;
  onAddPostClick?: () => void;
  /** Controlled drawer open state for the mobile hamburger menu. */
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  /** Drawer body — sidebar items, edit-flow link, etc. Composed by the consumer. */
  mobileMenuContent?: ReactNode;
  /** Drawer header label. Defaults to the `flow.menu` translation. */
  mobileMenuTitle?: string;
  className?: string;
};

function FlowArrow() {
  return <ChevronsRight className="w-3.5 h-3.5 text-muted-foreground/40 mt-[3px] shrink-0" aria-hidden="true" />;
}

const TAB_LIST_CLASSES =
  'flex items-center gap-3 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]';

const TAB_LIST_FADE_CLASSES =
  '[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]';

export function SubspaceFlowTabs({
  phases,
  activePhaseId,
  onPhaseChange,
  canEditFlow,
  canAddPost,
  editFlowHref,
  onEditFlowClick,
  onAddPostClick,
  mobileMenuOpen,
  onMobileMenuOpenChange,
  mobileMenuContent,
  mobileMenuTitle,
  className,
}: SubspaceFlowTabsProps) {
  const { t } = useTranslation('crd-subspace');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const activeTabRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activePhaseId]);

  if (phases.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-6 border-2 border-dashed border-border rounded-lg',
          className
        )}
      >
        <p className="text-body text-muted-foreground">{t('flow.emptyState')}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        {createPortal(
          <>
            <nav
              className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
              aria-label={t('a11y.bottomBar')}
            >
              <div className="flex items-center h-14">
                {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
                {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
                <ul role="list" className={cn(TAB_LIST_CLASSES, 'flex-1 min-w-0 px-3')}>
                  {phases.map(phase => {
                    const isActive = phase.id === activePhaseId;
                    return (
                      <li
                        key={phase.id}
                        ref={isActive ? activeTabRef : undefined}
                        className="inline-flex items-center shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => onPhaseChange(phase.id)}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={t('flow.phaseTab', { name: phase.label })}
                          className={cn(
                            'whitespace-nowrap py-2 px-1 transition-colors text-control rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {phase.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="w-px h-6 bg-border" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => onMobileMenuOpenChange?.(true)}
                  className="shrink-0 px-4 h-full flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  aria-label={t('a11y.openMenu')}
                  aria-haspopup="dialog"
                  aria-expanded={mobileMenuOpen ?? false}
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </nav>
            {canAddPost && (
              <Button
                size="icon"
                className="fixed bottom-20 right-4 z-30 rounded-full size-14 shadow-lg"
                onClick={onAddPostClick}
                aria-label={t('flow.addPost')}
              >
                <Plus className="w-6 h-6" aria-hidden="true" />
              </Button>
            )}
          </>,
          document.body
        )}

        <Sheet open={mobileMenuOpen ?? false} onOpenChange={onMobileMenuOpenChange}>
          <SheetContent side="left" closeLabel={t('a11y.close')}>
            <SheetHeader>
              <SheetTitle>{mobileMenuTitle ?? t('flow.menu')}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6 overflow-y-auto">{mobileMenuContent}</div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {canEditFlow &&
        (editFlowHref ? (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={t('flow.editFlow')}
            asChild={true}
          >
            <a href={editFlowHref}>
              <Layout className="w-4 h-4" aria-hidden="true" />
            </a>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={t('flow.editFlow')}
            onClick={onEditFlowClick}
          >
            <Layout className="w-4 h-4" aria-hidden="true" />
          </Button>
        ))}

      <nav className="flex-1 min-w-0" aria-label={t('a11y.flowTabs')}>
        {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
        {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
        <ul role="list" className={cn(TAB_LIST_CLASSES, canAddPost && TAB_LIST_FADE_CLASSES)}>
          {phases.map((phase, index) => {
            const isActive = phase.id === activePhaseId;
            return (
              <li key={phase.id} ref={isActive ? activeTabRef : undefined} className="inline-flex items-start shrink-0">
                {index > 0 && (
                  <span className="mr-3" aria-hidden="true">
                    <FlowArrow />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPhaseChange(phase.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={t('flow.phaseTab', { name: phase.label })}
                  className={cn(
                    'pb-2 transition-all duration-200 whitespace-nowrap border-b-2 select-none text-control rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted font-medium'
                  )}
                >
                  {phase.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {canAddPost && (
        <Button size="sm" className="shrink-0 gap-2" onClick={onAddPostClick}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('flow.addPost')}
        </Button>
      )}
    </div>
  );
}
