import { FileText, Image as ImageIcon, Megaphone, Presentation, StickyNote, Vote } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type FramingChipId = 'whiteboard' | 'memo' | 'document' | 'cta' | 'image' | 'poll';

type Chip = {
  id: FramingChipId;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  activeClass: string;
  disabled?: boolean;
};

const CHIPS: Chip[] = [
  {
    id: 'whiteboard',
    labelKey: 'callout.whiteboard',
    icon: Presentation,
    activeClass: 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/20',
  },
  {
    id: 'memo',
    labelKey: 'callout.memo',
    icon: StickyNote,
    activeClass: 'text-chart-2 bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/20',
  },
  {
    id: 'document',
    labelKey: 'callout.document',
    icon: FileText,
    activeClass: '',
    disabled: true,
  },
  {
    id: 'cta',
    labelKey: 'callout.callToAction',
    icon: Megaphone,
    activeClass: 'text-chart-3 bg-chart-3/10 hover:bg-chart-3/20 border-chart-3/20',
  },
  {
    id: 'image',
    labelKey: 'callout.mediaGallery',
    icon: ImageIcon,
    activeClass: 'text-chart-1 bg-chart-1/10 hover:bg-chart-1/20 border-chart-1/20',
  },
  {
    id: 'poll',
    labelKey: 'callout.poll',
    icon: Vote,
    activeClass: 'text-chart-4 bg-chart-4/10 hover:bg-chart-4/20 border-chart-4/20',
  },
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
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-body-emphasis transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? cn(chip.activeClass, 'ring-1 ring-offset-1')
                  : 'bg-background border-border text-foreground hover:bg-muted',
                chip.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                locked && !active && !chip.disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <chip.icon className="w-4 h-4" aria-hidden="true" />
              <span>{t(chip.labelKey as 'callout.whiteboard')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
