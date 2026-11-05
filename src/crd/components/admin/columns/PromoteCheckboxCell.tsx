import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/crd/primitives/checkbox';

type PromoteCheckboxCellProps = {
  checked: boolean;
  /** Resource display name — the checkbox's accessible name reads "Promote <name>". */
  name: string;
  /** True while a promote change is in flight; blocks further clicks. */
  disabled?: boolean;
  onCheckedChange: (next: boolean) => void;
};

/**
 * Renders the "Promote" column — a checkbox reflecting the stored
 * platform-promote flag. The checked state always comes from the caller's
 * data, so a failed save leaves the box showing the stored value.
 */
export function PromoteCheckboxCell({ checked, name, disabled, onCheckedChange }: PromoteCheckboxCellProps) {
  const { t } = useTranslation('crd-admin');

  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      aria-label={t('columns.promoteOf', { name })}
      aria-busy={disabled || undefined}
      onCheckedChange={value => onCheckedChange(value === true)}
    />
  );
}
