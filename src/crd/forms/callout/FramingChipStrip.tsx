import {
  ClipboardList,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Megaphone,
  MoreHorizontal,
  Presentation,
  StickyNote,
  Users,
  Vote,
  X,
} from 'lucide-react';
import { type ComponentType, type SVGProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteFramingDialog } from '@/crd/components/dialogs/DeleteFramingDialog';
import { chipIconTint, chipSurfaceTint } from '@/crd/forms/callout/chipTints';
import { cn } from '@/crd/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

export type FramingChipId =
  | 'whiteboard'
  | 'memo'
  | 'document'
  | 'cta'
  | 'image'
  | 'poll'
  | 'contributors'
  | 'spaces'
  | 'form';

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
  // Feature 013: the "Subspaces" framing (chip id stays `'spaces'` → maps to
  // CalloutFramingType.Spaces; the visible label is "Subspaces").
  { id: 'spaces', labelKey: 'callout.subspaces', icon: FolderTree },
  // Admin-only: the consumer leaves `form` out of `allowedChips` for anyone who
  // is not a space admin, so it never reaches the row or the More menu for them.
  { id: 'form', labelKey: 'callout.form', icon: ClipboardList },
];

/**
 * The chips kept on the surface; everything else moves behind the "More" menu.
 *
 * Chosen from usage (Sept 2026): whiteboard 162, memo 97, media gallery 73 —
 * the next one down is an order of magnitude smaller. The row used to show all
 * eight, which gave a framing type nobody picks the same share of the opening
 * screen as the one most people do, and grew by a chip with every new framing
 * type we shipped.
 *
 * The caveat on that data, from the analyst: the counts measure activity on a
 * framing type rather than creation of one, and cannot separate "added to a
 * post" from "asked for as a response". It is good enough to pick three; it is
 * not good enough to order the menu, which stays in `CHIPS` order.
 */
const PRIMARY_CHIP_IDS: FramingChipId[] = ['whiteboard', 'memo', 'image'];

/**
 * Below this many available chips the menu is pointless — it would hold one or
 * two items while the row has room for them. Consumers that narrow the list via
 * `allowedChips` (a template form, a VC knowledge base) land here and keep the
 * flat row they have today.
 */
const MIN_CHIPS_FOR_MENU = 5;

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
  /**
   * Chips whose framing kind is fixed once created. In edit mode an active chip
   * listed here is inert: it cannot be cleared back to `'none'` (no confirmation
   * dialog) and explains why through the type-locked hint.
   */
  fixedKindChips?: FramingChipId[];
  className?: string;
};

export function FramingChipStrip({
  value,
  onChange,
  editMode = false,
  disabledChips,
  allowedChips,
  fixedKindChips,
  className,
}: FramingChipStripProps) {
  const { t } = useTranslation('crd-space');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const chips = allowedChips ? CHIPS.filter(chip => allowedChips.includes(chip.id)) : CHIPS;

  // With few enough chips available the row shows all of them, exactly as before.
  const useMenu = chips.length >= MIN_CHIPS_FOR_MENU;
  // The selected chip is always on the surface, even when it is one of the ones
  // the menu normally holds: a choice you have already made must stay visible
  // and clearable without reopening a menu to find it.
  const rowChips = useMenu ? chips.filter(chip => PRIMARY_CHIP_IDS.includes(chip.id) || chip.id === value) : chips;
  const menuChips = useMenu ? chips.filter(chip => !rowChips.includes(chip)) : [];

  const handleClick = (chip: Chip) => {
    if (editMode) {
      // Existing callout / template: the framing type can't be switched — only
      // the active chip can be cleared back to `'none'`, behind a confirmation
      // (the framing content is destroyed). Inactive chips are inert. The active
      // chip bypasses the `disabledChips` guard on purpose: a framing type that
      // became entitlement-disabled after creation (e.g. `document` once the
      // office-documents flag is revoked) must still be clearable — clearing only
      // ever reduces capability.
      if (chip.id === value && !fixedKindChips?.includes(chip.id)) setConfirmClearOpen(true);
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
        {/* The menu trigger sits beside the radiogroup, not inside it: "More" is
            not one of the choices, it is the way to reach the rest of them, and
            a screen reader announcing it as the fourth option would be a lie. */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="radiogroup"
            aria-label={t('forms.framingType')}
            className={cn('flex flex-wrap gap-2 overflow-x-auto', className)}
          >
            {rowChips.map(chip => {
              const active = value === chip.id;
              const disabledInfo = disabledChips?.[chip.id];
              const isDisabled = Boolean(disabledInfo);
              // In edit mode the active chip is always interactive (to clear the
              // framing) even if its type is otherwise entitlement-disabled —
              // clearing only reduces capability. Every other inactive chip is
              // inert; in create mode all chips are live.
              const fixedActive = editMode && active && Boolean(fixedKindChips?.includes(chip.id));
              const activeClearable = editMode && active && !fixedActive;
              const isInert = fixedActive || (!activeClearable && (isDisabled || (editMode && !active)));
              return (
                // biome-ignore lint/a11y/useSemanticElements: the chip is a styled <button>, not an <input type="radio">
                <button
                  key={chip.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-disabled={isInert ? 'true' : undefined}
                  aria-label={t(chip.labelKey as 'callout.whiteboard')}
                  title={
                    disabledInfo?.tooltip ??
                    (fixedActive || (editMode && !active) ? t('forms.typeLockedHint') : undefined)
                  }
                  onClick={() => handleClick(chip)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    active
                      ? cn(chipSurfaceTint(chip.id), 'text-foreground')
                      : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                    isDisabled && !activeClearable && 'opacity-50 cursor-not-allowed pointer-events-none',
                    editMode && !active && !isDisabled && 'opacity-60 cursor-not-allowed',
                    fixedActive && 'cursor-not-allowed'
                  )}
                >
                  <chip.icon className={cn('w-4 h-4', chipIconTint(chip.id))} aria-hidden="true" />
                  <span>{t(chip.labelKey as 'callout.whiteboard')}</span>
                  {/* The X marks the active chip as removable; clicking the chip itself
                    deselects (create) or asks to confirm clearing the framing (edit). */}
                  {active && <X className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {menuChips.length > 0 && (
            <DropdownMenu>
              {/* In edit mode the framing type is locked, so nothing in the menu
                  can be chosen. The trigger is greyed and inert for the same
                  reason the inactive chips are, and carries the same hint —
                  hiding it would make the row change shape between create and
                  edit for no reason the user can see. */}
              <DropdownMenuTrigger
                disabled={editMode}
                aria-label={t('forms.moreFramingTypes')}
                title={editMode ? t('forms.typeLockedHint') : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                  editMode && 'opacity-60 cursor-not-allowed'
                )}
              >
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                <span>{t('forms.moreFramingTypes')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>{t('forms.moreFramingTypesHeading')}</DropdownMenuLabel>
                {menuChips.map(chip => {
                  const disabledInfo = disabledChips?.[chip.id];
                  const isDisabled = Boolean(disabledInfo);
                  return (
                    <DropdownMenuItem
                      key={chip.id}
                      // Not Radix's `disabled`: that sets `pointer-events: none`,
                      // which would swallow the tooltip explaining *why* the type
                      // is unavailable. Inert via aria + a prevented select keeps
                      // the row hoverable so the reason can still be read.
                      aria-disabled={isDisabled ? 'true' : undefined}
                      title={disabledInfo?.tooltip}
                      onSelect={event => {
                        if (isDisabled) {
                          event.preventDefault();
                          return;
                        }
                        onChange(chip.id);
                      }}
                      className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}
                    >
                      <chip.icon className={cn('w-4 h-4', chipIconTint(chip.id))} aria-hidden="true" />
                      <span>{t(chip.labelKey as 'callout.whiteboard')}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
