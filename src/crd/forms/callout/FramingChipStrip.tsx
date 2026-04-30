import { FileText, Image as ImageIcon, Megaphone, Presentation, StickyNote, Vote, X } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type FramingChipId = 'whiteboard' | 'memo' | 'document' | 'cta' | 'image' | 'poll';

type Chip = {
  id: FramingChipId;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

const CHIPS: Chip[] = [
  { id: 'whiteboard', labelKey: 'callout.whiteboard', icon: Presentation },
  { id: 'memo', labelKey: 'callout.memo', icon: StickyNote },
  { id: 'document', labelKey: 'callout.document', icon: FileText },
  { id: 'cta', labelKey: 'callout.callToAction', icon: Megaphone },
  { id: 'image', labelKey: 'callout.mediaGallery', icon: ImageIcon },
  { id: 'poll', labelKey: 'callout.poll', icon: Vote },
];

export type FramingChipStripProps = {
  /** Currently-selected chip, or `'none'` if no chip is active. */
  value: FramingChipId | 'none';
  /** Called when the user activates a chip. Passing `'none'` means "deselect". */
  onChange: (next: FramingChipId | 'none') => void;
  /**
   * When true, non-active chips are non-interactive and clicking the active chip
   * fires `onChange('none')` (edit-mode "switch to None" flow — see plan D6).
   */
  locked?: boolean;
  className?: string;
};

export function FramingChipStrip({ value, onChange, locked = false, className }: FramingChipStripProps) {
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
      <span className="text-label text-muted-foreground uppercase">{t('forms.framingType')}</span>
      <div
        role="radiogroup"
        aria-label={t('forms.framingType')}
        className={cn('flex flex-wrap gap-2 overflow-x-auto', className)}
      >
        {CHIPS.map(chip => {
          const active = value === chip.id;
          const isInert = chip.disabled || (locked && !active);
          return (
            // biome-ignore lint/a11y/useSemanticElements: the chip is a styled <button>, not an <input type="radio">
            <button
              key={chip.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={isInert ? 'true' : undefined}
              aria-label={t(chip.labelKey as 'callout.whiteboard')}
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
              <span>{t(chip.labelKey as 'callout.whiteboard')}</span>
              {active && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
