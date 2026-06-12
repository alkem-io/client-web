import { Link as LinkIcon, MessageSquare, Presentation, StickyNote, X } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type ResponseTypeChipId = 'link' | 'post' | 'memo' | 'whiteboard';

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
];

export type ResponseTypeChipStripProps = {
  /** Currently-selected response-type id, or `'none'` if nothing is selected. */
  value: ResponseTypeChipId | 'none';
  /** Called when the user activates a chip. `'none'` means "deselect". */
  onChange: (next: ResponseTypeChipId | 'none') => void;
  /**
   * Edit-mode lock: the response type is fixed once the callout exists, so
   * every chip click (active or not) is a no-op and the remove affordance is
   * hidden. The old UI never allowed changing or removing a callout's type.
   */
  locked?: boolean;
  /**
   * When provided, only these chips are rendered (in `CHIPS` order). Used by the
   * consumer to limit which response types a callout may offer — e.g. a Virtual
   * Contributor's knowledge base allows only Posts and Links & Files.
   * `undefined` renders all chips.
   */
  allowedChips?: ResponseTypeChipId[];
  className?: string;
};

export function ResponseTypeChipStrip({
  value,
  onChange,
  locked = false,
  allowedChips,
  className,
}: ResponseTypeChipStripProps) {
  const { t } = useTranslation('crd-space');

  const chips = allowedChips ? CHIPS.filter(chip => allowedChips.includes(chip.id)) : CHIPS;

  const handleClick = (chip: Chip) => {
    if (chip.disabled) return;
    // Edit-mode lock: the response type is fixed once the callout exists — the
    // old UI never allowed changing or removing it, so every click is a no-op.
    if (locked) return;
    if (chip.id === value) {
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
          const active = value === chip.id;
          const isInert = chip.disabled || (locked && !active);
          return (
            // biome-ignore lint/a11y/useSemanticElements: styled <button>, not <input type="radio">
            <button
              key={chip.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={isInert ? 'true' : undefined}
              aria-label={t(chip.labelKey as 'contributionSettings.types.link')}
              title={chip.disabled ? t('framing.comingSoon') : undefined}
              onClick={() => handleClick(chip)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                chip.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                locked && !active && !chip.disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <chip.icon className="w-4 h-4" aria-hidden="true" />
              <span>{t(chip.labelKey as 'contributionSettings.types.link')}</span>
              {/* The X is a "remove" affordance — hide it when locked, since the type can't be cleared. */}
              {active && !locked && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
