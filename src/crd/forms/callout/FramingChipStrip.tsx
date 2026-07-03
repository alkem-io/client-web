import { FileText, Image as ImageIcon, Megaphone, Presentation, StickyNote, Users, Vote, X } from 'lucide-react';
import { type ComponentType, type SVGProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteFramingDialog } from '@/crd/components/dialogs/DeleteFramingDialog';
import { cn } from '@/crd/lib/utils';

export type FramingChipId = 'whiteboard' | 'memo' | 'document' | 'cta' | 'image' | 'poll' | 'contributors';

type Chip = {
  id: FramingChipId;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const CHIPS: Chip[] = [
  { id: 'whiteboard', labelKey: 'callout.whiteboard', icon: Presentation },
  { id: 'memo', labelKey: 'callout.memo', icon: StickyNote },
  { id: 'document', labelKey: 'callout.document', icon: FileText },
  { id: 'cta', labelKey: 'callout.callToAction', icon: Megaphone },
  { id: 'image', labelKey: 'callout.mediaGallery', icon: ImageIcon },
  { id: 'poll', labelKey: 'callout.poll', icon: Vote },
  { id: 'contributors', labelKey: 'callout.contributors', icon: Users },
];

export type DisabledChipMap = Partial<Record<FramingChipId, { tooltip?: string }>>;

export type FramingChipStripProps = {
  /** Currently-selected chip, or `'none'` if no chip is active. */
  value: FramingChipId | 'none';
  /** Called when the user activates a chip. Passing `'none'` means "deselect". */
  onChange: (next: FramingChipId | 'none') => void;
  /**
   * Edit mode (existing callout / template): the framing *type* can no longer be
   * switched — clicking an inactive chip is a no-op. The only permitted change is
   * clearing the current framing back to `'none'` by clicking the active chip
   * (the X is just a visual remove affordance — the whole chip is the control),
   * which is gated behind a confirmation dialog (CRD rule 9 — the framing content
   * is lost). In create mode (`editMode` omitted) chips switch freely and the
   * active chip deselects immediately with no confirmation.
   */
  editMode?: boolean;
  /**
   * Marks specific chips as non-interactive with an optional tooltip explaining
   * why. Used by the consumer to gate chips behind license entitlements (e.g.
   * the `document` chip is disabled when the space lacks the office-documents
   * feature). The tooltip text is i18n'd by the consumer.
   */
  disabledChips?: DisabledChipMap;
  /**
   * When provided, only these chips are rendered (in `CHIPS` order). Used by the
   * consumer to limit which framing types a callout may use — e.g. a Virtual
   * Contributor's knowledge base offers none. `undefined` renders all chips.
   */
  allowedChips?: FramingChipId[];
  className?: string;
};

export function FramingChipStrip({
  value,
  onChange,
  editMode = false,
  disabledChips,
  allowedChips,
  className,
}: FramingChipStripProps) {
  const { t } = useTranslation('crd-space');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const chips = allowedChips ? CHIPS.filter(chip => allowedChips.includes(chip.id)) : CHIPS;

  const handleClick = (chip: Chip) => {
    if (editMode) {
      // Existing callout / template: the framing type can't be switched — only
      // the active chip can be cleared back to `'none'`, behind a confirmation
      // (the framing content is destroyed). Inactive chips are inert. The active
      // chip bypasses the `disabledChips` guard on purpose: a framing type that
      // became entitlement-disabled after creation (e.g. `document` once the
      // office-documents flag is revoked) must still be clearable — clearing only
      // ever reduces capability.
      if (chip.id === value) setConfirmClearOpen(true);
      return;
    }
    if (disabledChips?.[chip.id]) return;
    if (chip.id === value) {
      onChange('none');
    } else {
      onChange(chip.id);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <span className="text-label text-muted-foreground uppercase">{t('forms.framingType')}</span>
        <div
          role="radiogroup"
          aria-label={t('forms.framingType')}
          className={cn('flex flex-wrap gap-2 overflow-x-auto', className)}
        >
          {chips.map(chip => {
            const active = value === chip.id;
            const disabledInfo = disabledChips?.[chip.id];
            const isDisabled = Boolean(disabledInfo);
            // In edit mode the active chip is always interactive (to clear the
            // framing) even if its type is otherwise entitlement-disabled —
            // clearing only reduces capability. Every other inactive chip is
            // inert; in create mode all chips are live.
            const activeClearable = editMode && active;
            const isInert = !activeClearable && (isDisabled || (editMode && !active));
            return (
              // biome-ignore lint/a11y/useSemanticElements: the chip is a styled <button>, not an <input type="radio">
              <button
                key={chip.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={isInert ? 'true' : undefined}
                aria-label={t(chip.labelKey as 'callout.whiteboard')}
                title={disabledInfo?.tooltip ?? (editMode && !active ? t('forms.typeLockedHint') : undefined)}
                onClick={() => handleClick(chip)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                  isDisabled && !activeClearable && 'opacity-50 cursor-not-allowed pointer-events-none',
                  editMode && !active && !isDisabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <chip.icon className="w-4 h-4" aria-hidden="true" />
                <span>{t(chip.labelKey as 'callout.whiteboard')}</span>
                {/* The X marks the active chip as removable; clicking the chip itself
                    deselects (create) or asks to confirm clearing the framing (edit). */}
                {active && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
      <DeleteFramingDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        onConfirm={() => {
          setConfirmClearOpen(false);
          onChange('none');
        }}
      />
    </>
  );
}
