import { Columns3, FileText, Link as LinkIcon, MessageSquare, Presentation, StickyNote, X } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type ResponseTypeChipId = 'link' | 'post' | 'memo' | 'whiteboard' | 'document';

type Chip = {
  id: ResponseTypeChipId;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

const CHIPS: Chip[] = [
  { id: 'link', labelKey: 'contributionSettings.types.link', icon: LinkIcon },
  { id: 'post', labelKey: 'contributionSettings.types.post', icon: MessageSquare },
  { id: 'memo', labelKey: 'contributionSettings.types.memo', icon: StickyNote },
  { id: 'whiteboard', labelKey: 'contributionSettings.types.whiteboard', icon: Presentation },
  { id: 'document', labelKey: 'contributionSettings.types.document', icon: FileText },
];

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

  const handleClick = (chip: Chip) => {
    if (chip.disabled) return;
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
      <div
        role="radiogroup"
        aria-label={t('contributionSettings.heading')}
        className={cn('flex flex-wrap gap-2 overflow-x-auto', className)}
      >
        {chips.map(chip => {
          const active = effectiveValue === chip.id;
          const disabledInfo = disabledChips?.[chip.id];
          // A chip is "disabled" when it is statically off (`chip.disabled`, e.g.
          // "coming soon") or entitlement-gated by the consumer (`disabledInfo`).
          const isDisabled = chip.disabled || Boolean(disabledInfo);
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
              title={
                disabledInfo?.tooltip ??
                (chip.disabled
                  ? t('framing.comingSoon')
                  : locked
                    ? t('contributionSettings.typeLockedHint')
                    : undefined)
              }
              onClick={() => handleClick(chip)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                locked && !active && !isDisabled && 'opacity-60 cursor-not-allowed',
                // The active locked chip keeps its selected (primary) styling so the
                // current type stays obvious, but signals it can't be acted on.
                locked && active && 'cursor-not-allowed'
              )}
            >
              <chip.icon className="w-4 h-4" aria-hidden="true" />
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
              'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              tasksActive
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Columns3 className="w-4 h-4" aria-hidden="true" />
            <span>{tasksLabel}</span>
            {tasksActive && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
