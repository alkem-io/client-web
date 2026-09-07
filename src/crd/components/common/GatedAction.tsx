import { cloneElement, type ReactElement } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type GatedActionProps = {
  /**
   * When set, the action is gated: the control is disabled and this string is shown as
   * its tooltip. When undefined, the child renders and behaves normally.
   */
  disabledReason?: string;
  children: ReactElement;
};

type GatedChildProps = {
  disabled?: boolean;
  'aria-disabled'?: boolean;
};

/**
 * Renders an action as unavailable, with a tooltip explaining why.
 *
 * The control gets the native `disabled` attribute so it reads as unavailable at a glance
 * — greyed out and not clickable — rather than merely being announced as disabled while
 * still looking active.
 *
 * The tooltip therefore hangs off a focusable wrapper rather than the control itself. A
 * disabled control fires no pointer events and leaves the tab order, so anchoring the
 * tooltip to it would make the explanation unreachable by both mouse and keyboard. The
 * wrapper stays focusable, which keeps the reason available to keyboard and screen-reader
 * users (spec FR-003 / FR-004), while the control inside is genuinely inert (FR-005).
 *
 * Presentational only — it receives a finished, translated string and never evaluates
 * privileges itself.
 */
export function GatedAction({ disabledReason, children }: GatedActionProps) {
  if (!disabledReason) {
    return children;
  }

  const gatedChild = cloneElement(children as ReactElement<GatedChildProps>, {
    disabled: true,
    // Kept alongside the native attribute so assistive technology announces the state
    // even where the control is a composite widget rather than a bare <button>.
    'aria-disabled': true,
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: the wrapper is deliberately
            focusable because the control it wraps is disabled and cannot receive focus;
            without it the explanation would be keyboard-unreachable. */}
        <span tabIndex={0} className="inline-flex w-fit cursor-not-allowed">
          {gatedChild}
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  );
}
