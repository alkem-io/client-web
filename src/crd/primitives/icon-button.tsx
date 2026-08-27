import * as React from 'react';
import { Button, type ButtonProps } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface IconButtonProps extends ButtonProps {
  /** Tooltip label to show on hover/focus. Also the default aria-label. */
  tooltipLabel: string;
  /** Tooltip side position */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Icon button with automatic tooltip.
 * Use this for all icon-only buttons that need tooltips.
 * Ported from the prototype's `src/app/components/ui/icon-button.tsx`.
 *
 * @example
 * <IconButton variant="ghost" tooltipLabel="Settings" onClick={handleSettings}>
 *   <Settings className="size-4" />
 * </IconButton>
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ tooltipLabel, tooltipSide = 'top', children, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <Button ref={ref} size="icon" aria-label={ariaLabel || tooltipLabel} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{tooltipLabel}</TooltipContent>
      </Tooltip>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton };
