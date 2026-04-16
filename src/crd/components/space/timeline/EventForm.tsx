import { isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { DateField } from '@/crd/forms/DateField';
import { DurationField } from '@/crd/forms/DurationField';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TimeField } from '@/crd/forms/TimeField';
import { TagsInput } from '@/crd/forms/tags-input';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Switch } from '@/crd/primitives/switch';

type EventFormValues = {
  displayName: string;
  type: string | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  wholeDay: boolean;
  durationMinutes: number | undefined;
  description: string;
  locationCity: string;
  tags: string[];
  visibleOnParentCalendar: boolean;
};

type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

type EventTypeOption = { value: string; label: string };

type EventFormProps = {
  values: EventFormValues;
  errors: EventFormErrors;
  onChange: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  /** Controls rendering of the "Visible on parent calendar" switch (FR-024). */
  isSubspace: boolean;
  typeOptions: EventTypeOption[];
  /** Optional left-of-Save footer actions (e.g., Back, Delete, Cancel). */
  footerActionsLeft?: ReactNode;
};

/** Controlled presentational form. Layout matches spec FR-020; responsive
 *  stacking at <768px (one column); errors rendered inline per field. */
export function EventForm({
  values,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  isSubspace,
  typeOptions,
  footerActionsLeft,
}: EventFormProps) {
  const { t } = useTranslation('crd-space');
  const displayNameId = useId();
  const typeId = useId();
  const descriptionId = useId();
  const locationId = useId();
  const tagsId = useId();
  const wholeDayId = useId();
  const visibleOnParentId = useId();

  const sameDay = values.startDate && values.endDate && isSameDay(values.startDate, values.endDate);
  const timeFieldsDisabled = values.wholeDay || isSubmitting;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {/* Row 1: displayName + type */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={displayNameId} className="text-sm font-medium">
            {t('calendar.fields.displayName')}
            <span className="ml-0.5 text-destructive">*</span>
          </label>
          <Input
            id={displayNameId}
            value={values.displayName}
            onChange={event => onChange('displayName', event.target.value)}
            disabled={isSubmitting}
            aria-label={t('calendar.fields.displayName')}
            aria-invalid={Boolean(errors.displayName) || undefined}
            className={cn(errors.displayName && 'border-destructive')}
          />
          {errors.displayName && <span className="text-xs text-destructive">{errors.displayName}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={typeId} className="text-sm font-medium">
            {t('calendar.fields.type')}
            <span className="ml-0.5 text-destructive">*</span>
          </label>
          <Select value={values.type} onValueChange={value => onChange('type', value)} disabled={isSubmitting}>
            <SelectTrigger
              id={typeId}
              aria-label={t('calendar.fields.type')}
              aria-invalid={Boolean(errors.type) || undefined}
              className={cn(errors.type && 'border-destructive')}
            >
              <SelectValue placeholder={t('calendar.fields.type')} />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <span className="text-xs text-destructive">{errors.type}</span>}
        </div>
      </div>

      {/* Row 2: start date | start time | end date | end time-or-duration.
          Symmetric 4-column grid on desktop so the matching pickers align
          horizontally; stacks vertically on mobile. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <DateField
          label={t('calendar.fields.startDate')}
          value={values.startDate}
          onChange={next => onChange('startDate', next)}
          disabled={isSubmitting}
        />
        <TimeField
          label={t('calendar.fields.startTime')}
          value={values.startDate}
          onChange={next => onChange('startDate', next)}
          disabled={timeFieldsDisabled}
        />
        <DateField
          label={t('calendar.fields.endDate')}
          value={values.endDate}
          onChange={next => onChange('endDate', next)}
          minDate={values.startDate}
          disabled={isSubmitting}
          error={errors.endDate}
        />
        {sameDay ? (
          <DurationField
            label={t('calendar.fields.duration')}
            startDate={values.startDate}
            value={values.durationMinutes}
            onChange={next => onChange('durationMinutes', next)}
            disabled={timeFieldsDisabled}
            error={errors.durationMinutes}
          />
        ) : (
          <TimeField
            label={t('calendar.fields.endTime')}
            value={values.endDate}
            onChange={next => onChange('endDate', next)}
            minTime={values.startDate}
            disabled={timeFieldsDisabled}
            error={errors.endDate}
          />
        )}
      </div>

      {/* Row 2b: whole-day toggle on its own row, full width — keeps row 2's
          field heights symmetric (no toggle box throwing off alignment). */}
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <label htmlFor={wholeDayId} className="text-sm font-medium">
          {t('calendar.fields.wholeDay')}
        </label>
        <Switch
          id={wholeDayId}
          checked={values.wholeDay}
          onCheckedChange={next => onChange('wholeDay', next)}
          disabled={isSubmitting}
          aria-label={t('calendar.fields.wholeDay')}
        />
      </div>

      {/* Row 3: description (markdown) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={descriptionId} className="text-sm font-medium">
          {t('calendar.fields.description')}
        </label>
        <div id={descriptionId}>
          <MarkdownEditor
            value={values.description}
            onChange={next => onChange('description', next)}
            disabled={isSubmitting}
          />
        </div>
        {errors.description && <span className="text-xs text-destructive">{errors.description}</span>}
      </div>

      {/* Row 4: location + tags */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={locationId} className="text-sm font-medium">
            {t('calendar.fields.location')}
          </label>
          <Input
            id={locationId}
            value={values.locationCity}
            onChange={event => onChange('locationCity', event.target.value)}
            disabled={isSubmitting}
            aria-label={t('calendar.fields.location')}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={tagsId} className="text-sm font-medium">
            {t('calendar.fields.tags')}
          </label>
          <div id={tagsId}>
            <TagsInput value={values.tags} onChange={next => onChange('tags', next)} />
          </div>
        </div>
      </div>

      {/* Row 5 (subspace only): visibleOnParentCalendar */}
      {isSubspace && (
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <label htmlFor={visibleOnParentId} className="text-sm font-medium">
            {t('calendar.fields.visibleOnParentCalendar')}
          </label>
          <Switch
            id={visibleOnParentId}
            checked={values.visibleOnParentCalendar}
            onCheckedChange={next => onChange('visibleOnParentCalendar', next)}
            disabled={isSubmitting}
            aria-label={t('calendar.fields.visibleOnParentCalendar')}
          />
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">{footerActionsLeft}</div>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {t('calendar.save')}
        </Button>
      </div>
    </form>
  );
}
