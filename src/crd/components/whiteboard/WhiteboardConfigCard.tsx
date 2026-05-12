import type { LucideIcon } from 'lucide-react';
import { Presentation } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type WhiteboardConfigCardProps = {
  /** Primary line — e.g. "New Whiteboard" / "Whiteboard". */
  title: string;
  /** Secondary line under the title — e.g. "Ready to be created" / "Configured". Hidden when omitted. */
  status?: string;
  /** Label of the action button on the right — e.g. "Configure" / "Edit drawing". */
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  /** Icon shown in the accent chip. Defaults to `Presentation`. */
  icon?: LucideIcon;
  /**
   * CSS colour for the icon chip — used both in the chip's `color-mix()` background and as the icon
   * colour. Pass a CSS custom-property reference such as `var(--primary)` (the default) or `var(--chart-2)`.
   */
  accentColor?: string;
  className?: string;
};

/**
 * A compact "this content exists / is configured — open the editor" row, shared by the callout
 * whiteboard-framing editor (`FramingEditorConnector`) and the whiteboard-template form
 * (`WhiteboardTemplateFormConnector`). Pure presentational — all text and the action handler come in
 * as props; the consumer owns the editor dialog it opens.
 */
export function WhiteboardConfigCard({
  title,
  status,
  actionLabel,
  onAction,
  disabled,
  icon: Icon = Presentation,
  accentColor = 'var(--primary)',
  className,
}: WhiteboardConfigCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4 animate-in fade-in',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="rounded-lg p-2"
          style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-body-emphasis">{title}</p>
          {status && <p className="text-caption text-muted-foreground">{status}</p>}
        </div>
      </div>
      <Button variant="outline" size="sm" className="h-8" disabled={disabled} onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
