/**
 * CRD form-field composite contracts.
 *
 * These are NEW additions to `src/crd/forms/`. Pure presentational, controlled
 * (value/onChange), no Formik or react-hook-form knowledge.
 */

export type DateFieldProps = {
  /** Localized label rendered above the field; also used as fallback aria-label. */
  label?: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  /** Earliest selectable date (inclusive). */
  minDate?: Date;
  /** Latest selectable date (inclusive). */
  maxDate?: Date;
  disabled?: boolean;
  /** Localized placeholder shown when value is undefined. */
  placeholder?: string;
  /** When set, an error message is shown below the field. */
  error?: string;
  required?: boolean;
  className?: string;
};

export type TimeFieldProps = {
  /** Localized label / aria-label. */
  label?: string;
  /**
   * Date carrying the time portion. Component formats to HH:mm for the native
   * <input type="time">. On change, preserves the date portion of `value`
   * (or uses today if `value` is undefined).
   */
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  /**
   * Lower bound on the time portion (HH:mm). Used when start and end share
   * the same calendar day to prevent end < start.
   */
  minTime?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export type DurationFieldProps = {
  /** Localized label. */
  label?: string;
  /** Anchor used to render the "ends at HH:mm" caption (computed from start + value minutes). */
  startDate: Date | undefined;
  /** Duration in minutes. */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Step in minutes for the numeric input. Defaults to 15. */
  step?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
};

// -----------------------------------------------------------------------------
// Calendar primitive (port of prototype DayPicker)
// -----------------------------------------------------------------------------

/**
 * `src/crd/primitives/calendar.tsx`
 *
 * Re-exports the DayPicker component with shadcn-style classNames mapping.
 * Consumers (DateField, EventsCalendarView) pass DayPicker props through.
 *
 * The primitive is intentionally a thin re-export; we don't constrain its props
 * here because DayPicker's surface is large and stable. Higher-level components
 * provide the contract.
 */
export type CalendarPrimitiveExports = {
  Calendar: unknown; // re-exported component; see implementation
};
