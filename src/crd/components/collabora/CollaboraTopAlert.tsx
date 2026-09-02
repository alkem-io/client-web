import type { LucideIcon } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type CollaboraTopAlertProps = {
  /** Leading icon — pick one that fits the cause (e.g. a service-down icon, not Wi-Fi). */
  icon: LucideIcon;
  /** Short message; include the "save your work" prompt where relevant. */
  message: string;
  className?: string;
};

/**
 * A floating alert card pinned to the top-centre of the Collabora editor, deliberately mirroring
 * Collabora Online's own offline banner ("You are currently offline…") so our service warnings
 * look native. Reusable across scenarios (WOPI down, other services) — the caller supplies the
 * icon + message. Collabora shows its *own* banner for a network drop but not for a backend
 * (WOPI) outage, so we fill that gap with a matching card.
 */
export function CollaboraTopAlert({ icon: Icon, message, className }: CollaboraTopAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'absolute top-3 left-1/2 -translate-x-1/2 z-10 flex max-w-xl items-start gap-3 rounded-lg border border-border bg-popover px-5 py-3 shadow-lg',
        className
      )}
    >
      <Icon className="size-5 shrink-0 text-warning mt-0.5" aria-hidden="true" />
      <span className="text-caption text-foreground">{message}</span>
    </div>
  );
}
