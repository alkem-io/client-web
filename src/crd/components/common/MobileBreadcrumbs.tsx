import { ChevronDown, ChevronRight, CornerDownRight, House } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type BreadcrumbTrailItem, CrumbVisual } from '@/crd/components/common/BreadcrumbsTrail';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { BreadcrumbEllipsis } from '@/crd/primitives/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

type MobileBreadcrumbsProps = {
  items: BreadcrumbTrailItem[];
  homeHref: string;
  className?: string;
};

// Written out as literal class names (not built from a template string) so the
// Tailwind build can find and generate them — a dynamically interpolated
// class name would never appear in source and would be silently dropped.
// Six steps comfortably cover every trail depth seen in practice; a deeper
// trail simply stops gaining extra indent past the last step.
const INDENT_CLASSES = ['pl-2', 'pl-6', 'pl-10', 'pl-14', 'pl-18', 'pl-22'] as const;

function indentClassFor(depth: number) {
  return INDENT_CLASSES[Math.min(depth, INDENT_CLASSES.length - 1)];
}

export function MobileBreadcrumbs({ items, homeHref, className }: MobileBreadcrumbsProps) {
  const { t } = useTranslation('crd-layout');
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  if (items.length === 0) return null;

  const openLabel = t('breadcrumbs.openLocationHierarchy');

  return (
    <div className={cn('inline-flex min-w-0 items-center gap-1.5 md:hidden', className)}>
      <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild={true}>
          <button
            type="button"
            aria-label={openLabel}
            className="flex min-h-11 min-w-11 items-center justify-center gap-0.5 rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <BreadcrumbEllipsis srLabel={openLabel} />
            <ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[min(60vh,480px)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto"
        >
          <DropdownMenuLabel className="text-label text-muted-foreground uppercase">
            {t('breadcrumbs.locationHierarchy')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild={true}>
            <a href={homeHref}>
              <House aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{t('breadcrumbs.home')}</span>
            </a>
          </DropdownMenuItem>
          {items.map((item, index) => {
            const depth = index + 1;
            const isCurrent = index === items.length - 1;
            const indentClass = indentClassFor(depth);
            const rowKey = `${item.label}|${item.href ?? ''}`;

            if (isCurrent) {
              return (
                <DropdownMenuItem key={rowKey} aria-current="page" className={cn(indentClass, 'bg-primary/5')}>
                  <CornerDownRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  <CrumbVisual avatar={item.avatar} icon={item.icon} />
                  <span className="flex-1 truncate">{item.label}</span>
                  <Badge className="ml-auto shrink-0 border-transparent bg-primary/10 text-primary">
                    {t('breadcrumbs.current')}
                  </Badge>
                </DropdownMenuItem>
              );
            }

            if (item.href) {
              return (
                <DropdownMenuItem key={rowKey} asChild={true} className={indentClass}>
                  <a href={item.href}>
                    <CornerDownRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    <CrumbVisual avatar={item.avatar} icon={item.icon} />
                    <span className="truncate">{item.label}</span>
                  </a>
                </DropdownMenuItem>
              );
            }

            return (
              <div
                key={rowKey}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-2 py-1.5 text-control text-muted-foreground',
                  indentClass
                )}
              >
                <CornerDownRight aria-hidden="true" className="size-3.5 shrink-0" />
                <CrumbVisual avatar={item.avatar} icon={item.icon} />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
