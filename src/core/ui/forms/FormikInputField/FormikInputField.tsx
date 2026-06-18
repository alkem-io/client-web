import { useField } from 'formik';
import { Loader2 } from 'lucide-react';
import type { ChangeEvent, CSSProperties, FocusEvent, HTMLInputTypeAttribute, ReactNode } from 'react';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import HelpButton from '@/core/ui/button/HelpButton';
import { cn } from '@/crd/lib/utils';
import { Input } from '@/crd/primitives/input';
import { Textarea } from '@/crd/primitives/textarea';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import CharacterCounter from '../characterCounter/CharacterCounter';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

type ContainerProps = {
  sx?: { flex?: number | string };
  width?: number | string;
  className?: string;
  style?: CSSProperties;
};

export type FormikInputFieldProps = {
  title?: string;
  name: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  helpIconText?: string;
  helpText?: string;
  helperText?: ReactNode;
  loading?: boolean;
  counterDisabled?: boolean;
  maxLength?: number;
  rows?: number;
  fullWidth?: boolean;
  endAdornment?: ReactNode;
  containerProps?: ContainerProps;
  // FormikFormattedInputField overrides value/onChange/onBlur/onFocus through here.
  value?: string;
  onChange?: (event: ChangeEvent<InputElement>) => void;
  onBlur?: (event: FocusEvent<InputElement>) => void;
  onFocus?: (event: FocusEvent<InputElement>) => void;
  // Arbitrary DOM attributes (aria-*, inputMode, step, min/max, etc.) flow through.
  [key: string]: any;
};

export const FormikInputField = ({
  title,
  name,
  type,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  autoComplete,
  helpIconText,
  helperText: _helperText,
  loading,
  rows,
  counterDisabled = false,
  maxLength,
  fullWidth,
  endAdornment,
  containerProps,
  value: valueOverride,
  onChange: onChangeOverride,
  onBlur: onBlurOverride,
  onFocus: onFocusOverride,
  ...rest
}: FormikInputFieldProps) => {
  // NOTE: FormikFormattedInputField relies on value/onChange/onBlur/onFocus being
  // overridable here without being merged into the Formik field defaults.
  const tErr = useValidationMessageTranslation();
  const [field, meta, helpers] = useField(name);
  const isError = Boolean(meta.error) && meta.touched;

  const helperText = (() => {
    if (!isError) {
      return _helperText;
    }

    if (typeof meta.error === 'string' && meta.error.indexOf('required') !== -1) {
      return tErr('forms.validations.required');
    }

    return tErr(meta.error as TranslationKey, { field: title ?? '' });
  })();

  const value = valueOverride ?? field.value ?? '';
  const handleChange = onChangeOverride ?? ((event: ChangeEvent<InputElement>) => helpers.setValue(event.target.value));
  const handleBlur = onBlurOverride ?? field.onBlur;
  const isMultiline = !!rows;
  const isDisabled = loading || disabled;

  const sharedProps = {
    name,
    placeholder,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: onFocusOverride,
    required,
    disabled: isDisabled,
    readOnly,
    autoComplete,
    'aria-invalid': isError || undefined,
    ...rest,
  };

  const adornment = (loading || helpIconText || endAdornment) && (
    <div className="absolute right-2 top-2 flex items-center gap-1">
      {loading && <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />}
      {helpIconText && <HelpButton helpText={helpIconText} />}
      {endAdornment}
    </div>
  );

  return (
    <div
      className={cn(fullWidth && 'w-full', containerProps?.className)}
      style={{
        ...(containerProps?.sx?.flex !== undefined && { flex: containerProps.sx.flex }),
        ...(containerProps?.width !== undefined && { width: containerProps.width }),
        ...containerProps?.style,
      }}
    >
      {title && (
        <label htmlFor={name} className="mb-1 block text-body-emphasis text-foreground">
          {title}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <div className="relative">
        {isMultiline ? (
          <Textarea
            id={name}
            rows={rows}
            className={cn(adornment && 'pr-10', isError && 'border-destructive')}
            {...sharedProps}
          />
        ) : (
          <Input
            id={name}
            type={type}
            className={cn(adornment && 'pr-10', isError && 'border-destructive')}
            {...sharedProps}
          />
        )}
        {adornment}
      </div>
      <CharacterCounter count={value?.length} maxLength={maxLength} disabled={counterDisabled || !maxLength}>
        {helperText ? <p className={cn('text-caption', isError && 'text-destructive')}>{helperText}</p> : null}
      </CharacterCounter>
    </div>
  );
};

export default FormikInputField;
