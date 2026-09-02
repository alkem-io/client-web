import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Label } from '@/crd/primitives/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

export type RoleMultiSelectProps<TRole extends string> = {
  /** All currently-selected roles (always includes every value in `lockedRoles`). */
  value: TRole[];
  onChange: (next: TRole[]) => void;

  /** Roles that are checked + disabled — the user can't uncheck them. */
  lockedRoles: TRole[];

  /** Roles the user can toggle on/off. Order is the rendering order. */
  optionalRoles: TRole[];

  /** Pre-localised label per role. */
  roleLabels: Record<TRole, string>;

  /** Prefix text shown next to the trigger ("Invite to be a:"). */
  triggerLabel: string;

  /** aria-label on the popover trigger button. */
  triggerAriaLabel: string;

  /** Optional helper line under the option list. */
  helperText?: string;

  className?: string;
};

/**
 * Multi-select role picker built on Popover + Checkbox group. CRD doesn't ship
 * a generic MultiSelect primitive; promoting this to one would have to wait for
 * a third multi-select use case. Keeping the locked-Member semantics inside
 * the form layer keeps the API minimal: callers pass `lockedRoles` + `value`
 * and the component never lets `value` drop a locked role.
 */
export function RoleMultiSelect<TRole extends string>({
  value,
  onChange,
  lockedRoles,
  optionalRoles,
  roleLabels,
  triggerLabel,
  triggerAriaLabel,
  helperText,
  className,
}: RoleMultiSelectProps<TRole>) {
  const [open, setOpen] = useState(false);

  const summary = [...lockedRoles, ...optionalRoles.filter(role => value.includes(role))]
    .map(role => roleLabels[role])
    .join(', ');

  const toggleOptional = (role: TRole, next: boolean) => {
    if (next) {
      // Preserve order: locked first, then optionalRoles in declaration order.
      const desired = new Set([...value, role]);
      onChange([...lockedRoles, ...optionalRoles.filter(r => desired.has(r))]);
    } else {
      onChange(value.filter(r => r !== role));
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-body text-muted-foreground whitespace-nowrap">{triggerLabel}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild={true}>
          <Button
            variant="outline"
            type="button"
            className="justify-between gap-2 min-w-[10rem] font-normal"
            aria-label={triggerAriaLabel}
            aria-expanded={open}
          >
            <span className="truncate text-control">{summary}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <ul className="flex flex-col gap-1 list-none p-0 m-0">
            {[...lockedRoles, ...optionalRoles].map(role => {
              const isLocked = lockedRoles.includes(role);
              const isChecked = isLocked || value.includes(role);
              const id = `role-multi-select-${role}`;
              return (
                <li key={role}>
                  <Label
                    htmlFor={id}
                    className={cn(
                      'flex items-center gap-2 rounded-sm px-2 py-1.5 text-control hover:bg-accent',
                      isLocked && 'opacity-70 cursor-default hover:bg-transparent'
                    )}
                  >
                    <Checkbox
                      id={id}
                      checked={isChecked}
                      disabled={isLocked}
                      onCheckedChange={next => toggleOptional(role, next === true)}
                    />
                    <span>{roleLabels[role]}</span>
                  </Label>
                </li>
              );
            })}
          </ul>
          {helperText && <p className="mt-2 px-2 text-caption text-muted-foreground">{helperText}</p>}
        </PopoverContent>
      </Popover>
    </div>
  );
}
