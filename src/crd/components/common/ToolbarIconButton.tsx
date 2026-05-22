import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/crd/lib/utils';

type ToolbarIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Renders the button in its active/selected state. */
  active?: boolean;
};

/**
 * Compact icon button for segmented toolbars — search, filter and view-mode
 * controls. Sharing one component keeps every control in the group aligned and
 * visually consistent.
 */
export const ToolbarIconButton = forwardRef<HTMLButtonElement, ToolbarIconButtonProps>(function ToolbarIconButton(
  { active = false, className, type, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        className
      )}
      {...props}
    />
  );
});
