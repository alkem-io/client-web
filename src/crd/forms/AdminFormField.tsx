import type { ReactNode } from 'react';

type AdminFormFieldProps = {
  /** id of the control this label points at (`htmlFor`). */
  id: string;
  label: string;
  /** Renders a red required asterisk after the label. */
  required?: boolean;
  /** Optional field-level error message. */
  error?: string;
  children: ReactNode;
};

/**
 * Labelled form field for the admin create/edit forms. The required asterisk is
 * a sibling of the `<label>` (not inside it) so the control's accessible name
 * stays clean. Shared across the organization/user/change-email forms.
 */
export function AdminFormField({ id, label, required = false, error, children }: AdminFormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-body-emphasis">
        <label htmlFor={id}>{label}</label>
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {' *'}
          </span>
        ) : null}
      </span>
      {children}
      {error ? <p className="text-caption text-destructive">{error}</p> : null}
    </div>
  );
}
