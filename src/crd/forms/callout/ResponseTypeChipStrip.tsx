import { FileText, Link as LinkIcon, MessageSquare, Presentation, StickyNote, X } from 'lucide-react';
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
  { id: 'document', labelKey: 'contributionSettings.types.document', icon: FileText, disabled: true },
];

export type ResponseTypeChipStripProps = {
  /** Currently-selected response-type id, or `'none'` if nothing is selected. */
  value: ResponseTypeChipId | 'none';
  /** Called when the user activates a chip. `'none'` means "deselect". */
  onChange: (next: ResponseTypeChipId | 'none') => void;
  /**
   * Edit-mode lock: clicking a non-active chip is a no-op; clicking the
   * active chip fires `onChange('none')` for the framing-to-None confirmation.
   */
  locked?: boolean;
  className?: string;
};

export function ResponseTypeChipStrip({ value, onChange, locked = false, className }: ResponseTypeChipStripProps) {
  const { t } = useTranslation('crd-space');

  const handleClick = (chip: Chip) => {
    if (chip.disabled) return;
    if (locked) {
      if (chip.id === value) onChange('none');
      return;
    }
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
        {CHIPS.map(chip => {
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
              {active && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
