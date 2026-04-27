import { ChevronsRight, Layout, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

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
  className?: string;
};

function FlowArrow() {
  return <ChevronsRight className="w-3.5 h-3.5 text-muted-foreground/40 mt-[3px] shrink-0" aria-hidden="true" />;
}

const TAB_LIST_CLASSES =
  'flex items-center gap-3 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]';

export function SubspaceFlowTabs({
  phases,
  activePhaseId,
  onPhaseChange,
  canEditFlow,
  canAddPost,
  editFlowHref,
  onEditFlowClick,
  onAddPostClick,
  className,
}: SubspaceFlowTabsProps) {
  const { t } = useTranslation('crd-subspace');

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

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
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
        <ul role="list" className={TAB_LIST_CLASSES}>
          {phases.map((phase, index) => {
            const isActive = phase.id === activePhaseId;
            return (
              <li key={phase.id} className="inline-flex items-start shrink-0">
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
                    'pb-2 transition-all duration-200 whitespace-nowrap border-b-2 select-none text-control',
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
