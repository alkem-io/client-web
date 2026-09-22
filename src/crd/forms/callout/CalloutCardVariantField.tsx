import { useId } from 'react';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type CalloutCardVariantFieldProps = {
  /** Off = compact (default), on = expanded. */
  expanded: boolean;
  onExpandedChange: (next: boolean) => void;
  /** Field label — e.g. "Expanded card". Also used as the switch's aria-label. */
  label: string;
  /** Fixed description shown beneath the switch, regardless of state. */
  description: string;
  disabled?: boolean;
  className?: string;
};

/**
 * "Expanded card" switch for a Subspaces-collection callout.
 *
 * Pure CRD: props-driven, no fetching, no business logic. Markup mirrors
 * `CalloutSelectionField` — the two fields are meant to read as siblings, the
 * card-variant field placed immediately after the complete selection field
 * — but the description here is ONE fixed string (not a pair that
 * swaps with the switch state): the same copy is used verbatim regardless
 * of on/off.
 */
export function CalloutCardVariantField({
  expanded,
  onExpandedChange,
  label,
  description,
  disabled = false,
  className,
}: CalloutCardVariantFieldProps) {
  const switchId = useId();

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Switch
          id={switchId}
          checked={expanded}
          onCheckedChange={onExpandedChange}
          disabled={disabled}
          aria-label={label}
        />
        <Label htmlFor={switchId} className="text-body text-foreground">
          {label}
        </Label>
      </div>
      <p className="mt-4 text-body text-foreground">{description}</p>
    </div>
  );
}
