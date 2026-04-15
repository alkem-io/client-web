import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/crd/primitives/sheet';

type TimelineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Visible title in the header (e.g., "Events", "Add event", "Edit event"). */
  title: string;
  /** Optional secondary line below the title (e.g., the event title in detail view). */
  subtitle?: string;
  /** Header-right slot (e.g., AddToCalendarMenu, ExportEventsToIcs, Edit/Back actions). */
  headerActions?: ReactNode;
  /** Footer-right slot (e.g., Save / Delete / Back). When provided, footer is rendered. */
  footerActions?: ReactNode;
  /** Body content — list view, detail view, or form view. */
  children: ReactNode;
  /** When true, desktop modal uses a wider max-width. Defaults to false. */
  wide?: boolean;
};

const DESKTOP_BREAKPOINT = '(min-width: 768px)';

/**
 * Responsive shell for the calendar/timeline UI surface.
 *   - tablet+ (≥768px): centred Dialog with sticky header (title + actions) and
 *     optional sticky footer (footerActions).
 *   - phone (<768px): full-screen Sheet from the bottom with the same structure.
 *
 * Pure presentational. Focus trap + restoration handled by Radix.
 */
export function TimelineDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  headerActions,
  footerActions,
  children,
  wide,
}: TimelineDialogProps) {
  const { t } = useTranslation('crd-space');
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {isDesktop ? (
          <DialogTitle className="text-lg font-semibold leading-tight">{title}</DialogTitle>
        ) : (
          <SheetTitle className="text-lg font-semibold leading-tight">{title}</SheetTitle>
        )}
        {subtitle ? (
          isDesktop ? (
            <DialogDescription className="mt-1 truncate">{subtitle}</DialogDescription>
          ) : (
            <SheetDescription className="mt-1 truncate">{subtitle}</SheetDescription>
          )
        ) : null}
      </div>
      {headerActions ? <div className="flex shrink-0 items-center gap-2">{headerActions}</div> : null}
    </div>
  );

  const footer = footerActions ? (
    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-background p-4">
      {footerActions}
    </div>
  ) : null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          closeLabel={t('calendar.cancel')}
          className={cn(
            'flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-0 overflow-hidden p-0',
            wide ? 'sm:max-w-6xl' : 'sm:max-w-3xl'
          )}
        >
          <DialogHeader className="border-b border-border p-4">{header}</DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          {footer}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        closeLabel={t('calendar.cancel')}
        className="flex h-[100dvh] w-full flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b border-border p-4">{header}</SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer}
      </SheetContent>
    </Sheet>
  );
}
