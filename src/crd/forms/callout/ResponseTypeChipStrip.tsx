import { Columns3, FileText, Link as LinkIcon, MessageSquare, Presentation, StickyNote, X } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipOverflowMenu, chipBaseClass, chipIdleClass, useChipOverflow } from '@/crd/forms/callout/ChipOverflowMenu';
import { chipIconTint, chipSurfaceTint } from '@/crd/forms/callout/chipTints';
import { cn } from '@/crd/lib/utils';

export type ResponseTypeChipId = 'link' | 'post' | 'memo' | 'whiteboard' | 'document';

type Chip = {
  id: ResponseTypeChipId;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const CHIPS: Chip[] = [
  { id: 'link', labelKey: 'contributionSettings.types.link', icon: LinkIcon },
  { id: 'post', labelKey: 'contributionSettings.types.post', icon: MessageSquare },
  { id: 'memo', labelKey: 'contributionSettings.types.memo', icon: StickyNote },
  { id: 'whiteboard', labelKey: 'contributionSettings.types.whiteboard', icon: Presentation },
  { id: 'document', labelKey: 'contributionSettings.types.document', icon: FileText },
];

/**
 * The response types kept on the surface; the rest move behind "More".
 *
 * Links & Files is the most-used contribution type by a distance (324 vs
 * whiteboard 162, memo 97, document 20), and Posts is the default way a space
 * asks for anything back. The third surfaced slot belongs to the Tasks board
 * when the consumer offers it — it is a create-only, flag-gated sibling of the
 * response types, and burying it behind a menu would hide a whole callout shape.
 */
const PRIMARY_CHIP_IDS: ResponseTypeChipId[] = ['link', 'post'];

/**
 * When the consumer does not offer Tasks (edit mode, or the flag is off), this
 * takes the third slot so the row still reads as three rather than two.
 */
const FALLBACK_PRIMARY_ID: ResponseTypeChipId = 'whiteboard';

export type DisabledResponseChipMap = Partial<Record<ResponseTypeChipId, { tooltip?: string }>>;

export type ResponseTypeChipStripProps = {
  /** Currently-selected response-type id, or `'none'` if nothing is selected. */
  value: ResponseTypeChipId | 'none';
  /** Called when the user activates a chip. `'none'` means "deselect". */
  onChange: (next: ResponseTypeChipId | 'none') => void;
  /**
   * Marks specific chips as non-interactive with an optional tooltip explaining
   * why. Mirrors `FramingChipStrip.disabledChips` — the consumer uses it to gate
   * a response type behind a license entitlement (e.g. the `document` chip is
   * disabled when the space lacks the office-documents feature). The tooltip text
   * is i18n'd by the consumer.
   */
  disabledChips?: DisabledResponseChipMap;
  /**
   * Edit-mode lock: the response type is fixed once the callout exists, so
   * every chip click (active or not) is a no-op and the remove affordance is
   * hidden. The old UI never allowed changing or removing a callout's type.
   * Every chip — including the active one — is marked `aria-disabled` and
   * carries the lock-hint tooltip so the locked state is conveyed consistently
   * to assistive tech (unlike framing, the response type can't even be cleared).
   */
  locked?: boolean;
  /**
   * When provided, only these chips are rendered (in `CHIPS` order). Used by the
   * consumer to limit which response types a callout may offer — e.g. a Virtual
   * Contributor's knowledge base allows only Posts and Links & Files.
   * `undefined` renders all chips.
   */
  allowedChips?: ResponseTypeChipId[];
  /**
   * Renders an extra "Tasks" chip alongside the response types (create only).
   * Selecting it turns the callout into a task board — it is a sibling of the
   * real response types, not a separate switch. When `tasksActive` no real chip
   * is shown selected; clicking a real chip switches back to that response type
   * (the consumer clears the board flag).
   */
  showTasksChip?: boolean;
  tasksActive?: boolean;
  tasksLabel?: string;
  onSelectTasks?: () => void;
  className?: string;
};

export function ResponseTypeChipStrip({
  value,
  onChange,
  locked = false,
  disabledChips,
  allowedChips,
  showTasksChip = false,
  tasksActive = false,
  tasksLabel,
  onSelectTasks,
  className,
}: ResponseTypeChipStripProps) {
  const { t } = useTranslation('crd-space');

  const chips = allowedChips ? CHIPS.filter(chip => allowedChips.includes(chip.id)) : CHIPS;
  // While the board is selected, no response chip reads as active — the Tasks
  // chip owns the selection — so a click on any response chip switches to it.
  const effectiveValue = tasksActive ? 'none' : value;

  const primaryIds = showTasksChip ? PRIMARY_CHIP_IDS : [...PRIMARY_CHIP_IDS, FALLBACK_PRIMARY_ID];
  const { rowChips, menuChips } = useChipOverflow(chips, primaryIds, effectiveValue);

  const handleClick = (chip: Chip) => {
    // Edit-mode lock: the response type is fixed once the callout exists — the
    // old UI never allowed changing or removing it, so every click is a no-op.
    if (locked) return;
    // Entitlement gate (mirrors FramingChipStrip): a chip the consumer marked
    // disabled — e.g. `document` when the space lacks the office-documents
    // feature — is inert.
    if (disabledChips?.[chip.id]) return;
    if (chip.id === effectiveValue) {
      onChange('none');
    } else {
      onChange(chip.id);
    }
  };

  return (
    <div className="space-y-3">
      <span className="text-label text-muted-foreground uppercase">{t('contributionSettings.heading')}</span>
      {/* The menu trigger sits beside the radiogroup, not inside it: "More" is a
          way to reach the other options, not an option. */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="radiogroup"
          aria-label={t('contributionSettings.heading')}
          className={cn('flex flex-wrap gap-2 overflow-x-auto', className)}
        >
          {rowChips.map(chip => {
            const active = effectiveValue === chip.id;
            const disabledInfo = disabledChips?.[chip.id];
            const isDisabled = Boolean(disabledInfo);
            // When locked, every chip is inert — the active one too, since the
            // response type can't be cleared (only fully fixed). Keep them all
            // aria-disabled so assistive tech doesn't read the active chip as a
            // live control that silently does nothing.
            const isInert = isDisabled || locked;
            return (
              // biome-ignore lint/a11y/useSemanticElements: styled <button>, not <input type="radio">
              <button
                key={chip.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={isInert ? 'true' : undefined}
                aria-label={t(chip.labelKey as 'contributionSettings.types.link')}
                title={disabledInfo?.tooltip ?? (locked ? t('contributionSettings.typeLockedHint') : undefined)}
                onClick={() => handleClick(chip)}
                className={cn(
                  chipBaseClass,
                  // Selected fills with the chip's own hue rather than a flat
                  // primary: a navy fill made every selection look identical and
                  // threw away the association the colour exists to build.
                  active ? cn(chipSurfaceTint(chip.id), 'text-foreground') : chipIdleClass(isInert),
                  // No pointer-events-none: it would swallow the `title` that
                  // says why the chip is unavailable. `handleClick` ignores it.
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  locked && !active && !isDisabled && 'opacity-60 cursor-not-allowed',
                  // The active locked chip keeps its selected styling so the
                  // current type stays obvious, but signals it can't be acted on.
                  locked && active && 'cursor-not-allowed'
                )}
              >
                <chip.icon className={cn('w-4 h-4', chipIconTint(chip.id))} aria-hidden="true" />
                <span>{t(chip.labelKey as 'contributionSettings.types.link')}</span>
                {/* The X is a "remove" affordance — hide it when locked, since the type can't be cleared. */}
                {active && !locked && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
              </button>
            );
          })}
          {/* Tasks board is a sibling of the response types, not a separate switch.
            Selecting it makes the callout a board of columns for posts. */}
          {showTasksChip && (
            // biome-ignore lint/a11y/useSemanticElements: styled <button>, not <input type="radio">
            <button
              type="button"
              role="radio"
              aria-checked={tasksActive}
              aria-label={tasksLabel}
              onClick={onSelectTasks}
              className={cn(
                chipBaseClass,
                tasksActive ? cn(chipSurfaceTint('tasks'), 'text-foreground') : chipIdleClass(false)
              )}
            >
              <Columns3 className={cn('w-4 h-4', chipIconTint('tasks'))} aria-hidden="true" />
              <span>{tasksLabel}</span>
              {tasksActive && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
            </button>
          )}
        </div>
        {menuChips.length > 0 && (
          <ChipOverflowMenu
            chips={menuChips.map(chip => {
              const disabledInfo = disabledChips?.[chip.id];
              return {
                id: chip.id,
                label: t(chip.labelKey as 'contributionSettings.types.link'),
                icon: chip.icon,
                disabled: disabledInfo && { reason: disabledInfo.tooltip },
              };
            })}
            label={t('contributionSettings.moreTypes')}
            heading={t('contributionSettings.moreTypesHeading')}
            locked={locked}
            lockedHint={t('contributionSettings.typeLockedHint')}
            onSelect={onChange}
          />
        )}
      </div>
    </div>
  );
}
