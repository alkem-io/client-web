import { MoreHorizontal } from 'lucide-react';
import { type ComponentType, type SVGProps, useId, useState } from 'react';
import { chipIconTint, type TintedChipKind } from '@/crd/forms/callout/chipTints';
import { cn } from '@/crd/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

/** Shape and focus ring shared by every chip in both strips and by the More trigger. */
export const chipBaseClass =
  'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/** An unselected chip. Only a chip that can be acted on reacts to hover. */
export const chipIdleClass = (inert: boolean) =>
  cn('bg-background border-border text-muted-foreground', !inert && 'hover:bg-muted hover:text-foreground');

/**
 * A menu holding a single chip saves no room — that chip fits in the slot the
 * More trigger would take — and costs a click to reach it.
 */
const MIN_MENU_ITEMS = 2;

/**
 * Splits a strip's chips between the row and the More menu.
 *
 * The split is decided on the chips outside `primaryIds`, before any selection,
 * so selecting a chip never flips the strip between the menu and flat layouts.
 * At most one of those chips is pulled into the row at a time, so the menu is
 * used only when it would still hold `MIN_MENU_ITEMS` without it.
 *
 * The selected chip is always in the row: a choice already made must stay
 * visible and clearable without reopening a menu. A chip the user clears also
 * stays in the row while nothing is selected — if it went back into the menu,
 * the button the user just pressed would vanish and keyboard focus would fall
 * to the page body. The strip reports that clear through `keepInRow`, from the
 * click itself, and any other choice it reports with `keepInRow(undefined)`.
 */
export function useChipOverflow<Chip extends { id: string }>(
  chips: Chip[],
  primaryIds: Chip['id'][],
  value: Chip['id'] | 'none'
) {
  const [clearedId, keepInRow] = useState<Chip['id'] | undefined>(undefined);
  const overflow = chips.filter(chip => !primaryIds.includes(chip.id));
  // With none of the primary chips offered there is no row for the menu to sit
  // beside, and a lone More button would hide every choice.
  if (overflow.length - 1 < MIN_MENU_ITEMS || overflow.length === chips.length) {
    return { rowChips: chips, menuChips: [], keepInRow };
  }
  const inRow = (chip: Chip) =>
    primaryIds.includes(chip.id) || chip.id === value || (value === 'none' && chip.id === clearedId);
  return { rowChips: chips.filter(inRow), menuChips: chips.filter(chip => !inRow(chip)), keepInRow };
}

export type OverflowMenuChip<Id extends TintedChipKind> = {
  id: Id;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Set when the chip can't be chosen; `reason` is shown under its label. */
  disabled?: { reason?: string };
};

type ChipOverflowMenuProps<Id extends TintedChipKind> = {
  chips: OverflowMenuChip<Id>[];
  /** The visible trigger text ("More"). */
  label: string;
  /**
   * The menu's heading, also the trigger's accessible name so the two strips'
   * triggers can be told apart. Must start with `label` (WCAG 2.5.3).
   */
  heading: string;
  /** The type is fixed (edit mode): the trigger stays focusable but won't open. */
  locked: boolean;
  lockedHint: string;
  onSelect: (id: Id) => void;
};

export function ChipOverflowMenu<Id extends TintedChipKind>({
  chips,
  label,
  heading,
  locked,
  lockedHint,
  onSelect,
}: ChipOverflowMenuProps<Id>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const lockedHintId = `${id}-locked`;

  return (
    // `open && !locked` as well as the guarded onOpenChange: a menu already open
    // when the strip locks must close, not stay usable.
    <DropdownMenu open={open && !locked} onOpenChange={next => setOpen(next && !locked)}>
      {/* Locked, nothing in the menu can be chosen. The trigger stays in the row
          so the strip keeps one shape in create and edit, and stays focusable
          (aria-disabled, not `disabled`) so keyboard users reach the hint. It
          drops the menu-button semantics Radix gives it, since it opens nothing,
          and carries the hint as its description, not only as a `title`. */}
      <DropdownMenuTrigger
        aria-label={heading}
        aria-disabled={locked ? 'true' : undefined}
        aria-haspopup={locked ? undefined : 'menu'}
        aria-expanded={locked ? undefined : open}
        aria-describedby={locked ? lockedHintId : undefined}
        title={locked ? lockedHint : undefined}
        className={cn(chipBaseClass, chipIdleClass(locked), locked && 'opacity-60 cursor-not-allowed')}
      >
        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
        {locked && (
          <span id={lockedHintId} className="sr-only">
            {lockedHint}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{heading}</DropdownMenuLabel>
        {chips.map(chip => {
          const isDisabled = Boolean(chip.disabled);
          const reasonId = `${id}-${chip.id}-reason`;
          return (
            <DropdownMenuItem
              key={chip.id}
              // Not Radix's `disabled`: that drops the item from arrow-key
              // navigation (and the primitive gives it pointer-events: none),
              // so nobody could reach the reason shown under the label.
              aria-disabled={isDisabled ? 'true' : undefined}
              // The name is the label alone; the reason is its description, and
              // typeahead matches on the label.
              aria-label={chip.label}
              aria-describedby={chip.disabled?.reason ? reasonId : undefined}
              textValue={chip.label}
              onSelect={event => {
                if (isDisabled || locked) {
                  event.preventDefault();
                  return;
                }
                onSelect(chip.id);
              }}
              className={cn(isDisabled && 'cursor-not-allowed')}
            >
              <chip.icon
                className={cn('w-4 h-4', chipIconTint(chip.id), isDisabled && 'opacity-50')}
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className={cn(isDisabled && 'opacity-50')}>{chip.label}</span>
                {/* Not dimmed with the label, and following the item's colour
                    when it is highlighted: the reason is meant to be read. */}
                {chip.disabled?.reason && (
                  <span
                    id={reasonId}
                    className="text-caption text-muted-foreground in-data-[highlighted]:text-accent-foreground"
                  >
                    {chip.disabled.reason}
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
