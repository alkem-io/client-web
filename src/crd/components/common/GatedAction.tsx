import { cloneElement, type ReactElement } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type GatedActionProps = {
  /**
   * When set, the action is gated: rendered aria-disabled, kept focusable, its
   * activation suppressed, and this string shown as the tooltip.
   * When undefined, the child renders and behaves normally.
   */
  disabledReason?: string;
  children: ReactElement;
};

type GatedChildProps = {
  'aria-disabled'?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
};

/**
 * Renders an action as unavailable, with a tooltip explaining why.
 *
 * Uses `aria-disabled` rather than the native `disabled` attribute on purpose: a natively
 * disabled control leaves the tab order and fires no pointer events, so it could show
 * neither a tooltip on keyboard focus nor announce a reason to assistive technology
 * (spec FR-002 vs FR-003/FR-004). Keeping it focusable and suppressing activation
 * satisfies both.
 *
 * Presentational only — it receives a finished, translated string and never evaluates
 * privileges itself.
 */
export function GatedAction({ disabledReason, children }: GatedActionProps) {
  if (!disabledReason) {
    return children;
  }

  const suppress = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const gatedChild = cloneElement(children as ReactElement<GatedChildProps>, {
    'aria-disabled': true,
    // Keep the control reachable by keyboard so the tooltip can open on focus.
    tabIndex: 0,
    onClick: suppress,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        suppress(event);
      }
    },
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>{gatedChild}</TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  );
}
