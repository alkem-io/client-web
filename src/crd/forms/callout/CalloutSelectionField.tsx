import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type SelectionMode = 'auto' | 'custom';

export type CalloutSelectionFieldProps = {
  /**
   * Current selection mode — controlled by the consumer. Defaults to 'auto'
   * (server default, FR-002): the switch is OFF for 'auto' (the collection
   * updates automatically) and ON for 'custom' (a fixed, manually curated list).
   */
  mode: SelectionMode;
  /** Called when the admin flips the mode switch. */
  onModeChange: (next: SelectionMode) => void;
  /**
   * Field label — describes what turning the switch ON does (e.g. "Manually
   * curated list"). Also used as the switch's aria-label.
   */
  label: string;
  /** Helper text shown when mode === 'auto' (switch off). Consumer supplies the contextual copy. */
  autoDescription: string;
  /** Helper text shown when mode === 'custom' (switch on). Consumer supplies the contextual copy. */
  customDescription: string;
  /**
   * Slot rendered beneath the switch only when `mode === 'custom'`.
   * The consumer mounts the picker (ContributorSelector or subspace selector)
   * here; the field itself fetches nothing (CRD rules).
   */
  pickerSlot?: ReactNode;
  disabled?: boolean;
  /** Forwarded to the outer wrapper for layout composition. */
  className?: string;
};

/**
 * Auto/custom selection mode switch for collection callouts (feature 025).
 *
 * Pure CRD: props-driven, no fetching, no business logic.
 * - The switch is OFF for 'auto' (the default) and ON for 'custom' — the label
 *   names the on-state ("Manually curated list") so an off switch reads as
 *   "manual curation is off", i.e. automatic (AC2 / FR-004).
 * - `label` + `autoDescription`/`customDescription` are supplied by the consumer
 *   so the copy is contextual per framing kind (contributors vs subspaces).
 * - `pickerSlot` is rendered only in custom mode — consumer wires the picker.
 */
export function CalloutSelectionField({
  mode,
  onModeChange,
  label,
  autoDescription,
  customDescription,
  pickerSlot,
  disabled = false,
  className,
}: CalloutSelectionFieldProps) {
  const isCustom = mode === 'custom';

  const handleToggle = (checked: boolean) => {
    onModeChange(checked ? 'custom' : 'auto');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* The setting toggle itself (e.g. "Manual selection", off by default) — the
          switch sits in front of the label, left-aligned and close, so the row
          reads clearly as a setting. */}
      <div className="flex items-center gap-2">
        <Switch
          id="callout-selection-mode"
          checked={isCustom}
          onCheckedChange={handleToggle}
          disabled={disabled}
          aria-label={label}
        />
        <Label htmlFor="callout-selection-mode" className="text-body text-foreground">
          {label}
        </Label>
      </div>

      {/* What the collection currently shows — a title (not helper text) that swaps
          with the setting state, so the setting name and the current behaviour stay
          visually distinct. */}
      <p className="text-body text-foreground">{isCustom ? customDescription : autoDescription}</p>

      {/* Picker slot — rendered only in custom mode */}
      {isCustom && pickerSlot !== undefined && <div className="mt-2">{pickerSlot}</div>}
    </div>
  );
}
