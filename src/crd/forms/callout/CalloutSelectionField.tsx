import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type SelectionMode = 'auto' | 'custom';

export type CalloutSelectionFieldProps = {
  /**
   * Current selection mode — controlled by the consumer.
   * Defaults to 'auto' (server default, FR-002).
   */
  mode: SelectionMode;
  /** Called when the admin flips the mode switch. */
  onModeChange: (next: SelectionMode) => void;
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
 * - Switch defaults to 'auto' (off = auto, on = custom) — AC2 / FR-004.
 * - Copy explains the distinction: auto updates automatically; custom is a
 *   fixed, manually curated list (spec FR-004).
 * - `pickerSlot` is rendered only in custom mode — consumer wires the picker.
 */
export function CalloutSelectionField({
  mode,
  onModeChange,
  pickerSlot,
  disabled = false,
  className,
}: CalloutSelectionFieldProps) {
  const { t } = useTranslation('crd-space');

  const isCustom = mode === 'custom';

  const handleToggle = (checked: boolean) => {
    onModeChange(checked ? 'custom' : 'auto');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mode switch row — matches the AllowCommentsField layout pattern */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="callout-selection-mode" className="text-body text-foreground">
            {t('forms.selection.label')}
          </Label>
          <p className="text-caption text-muted-foreground">
            {isCustom ? t('forms.selection.customDescription') : t('forms.selection.autoDescription')}
          </p>
        </div>
        <Switch
          id="callout-selection-mode"
          checked={isCustom}
          onCheckedChange={handleToggle}
          disabled={disabled}
          aria-label={t('forms.selection.label')}
        />
      </div>

      {/* Picker slot — rendered only in custom mode */}
      {isCustom && pickerSlot !== undefined && <div className="mt-2">{pickerSlot}</div>}
    </div>
  );
}
