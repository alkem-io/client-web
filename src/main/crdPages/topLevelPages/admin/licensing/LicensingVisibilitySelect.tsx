import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

type LicensingVisibilitySelectProps = {
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (next: string) => void;
  ariaLabel: string;
  disabled?: boolean;
};

/**
 * Inline visibility control for the Licensing section's Spaces rows (A14).
 * Deliberately not the `SpaceSettingsDialog`: that bundles visibility with the
 * alias field, which a License Manager may not submit.
 */
export function LicensingVisibilitySelect({
  value,
  options,
  onValueChange,
  ariaLabel,
  disabled,
}: LicensingVisibilitySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size="sm" aria-label={ariaLabel} className="min-w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
