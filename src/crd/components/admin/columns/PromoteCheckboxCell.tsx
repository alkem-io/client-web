import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/crd/primitives/checkbox';

type PromoteCheckboxCellProps = {
  checked: boolean;
  /** Resource display name — the checkbox's accessible name reads "Promote <name>". */
  name: string;
  /**
   * True while this row's change is in flight. Further clicks are ignored, but
   * the box stays focusable (aria-disabled, not disabled) so keyboard focus is kept.
   */
  saving?: boolean;
  onCheckedChange: (next: boolean) => void;
};

/**
 * Renders the "Promote" column — a checkbox reflecting the stored
 * platform-promote flag. The checked state always comes from the caller's
 * data, so a failed save leaves the box showing the stored value.
 */
export function PromoteCheckboxCell({ checked, name, saving, onCheckedChange }: PromoteCheckboxCellProps) {
  const { t } = useTranslation('crd-admin');

  return (
    <Checkbox
      checked={checked}
      aria-label={t('columns.promoteOf', { name })}
      className="aria-busy:cursor-wait aria-busy:opacity-50"
      aria-disabled={saving || undefined}
      aria-busy={saving || undefined}
      onCheckedChange={value => {
        if (!saving) onCheckedChange(value === true);
      }}
    />
  );
}
