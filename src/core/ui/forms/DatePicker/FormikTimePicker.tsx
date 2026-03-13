import { useField } from 'formik';
import { useMemo } from 'react';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import type { FormikInputProps } from '../FormikInputProps';
import AlkemioTimePicker, { type AlkemioTimePickerProps } from './AlkemioTimePicker';

interface FormikTimePickerProps extends FormikInputProps, Omit<AlkemioTimePickerProps, 'value' | 'onChange'> {}

const FormikTimePicker = ({ name, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, meta, helpers] = useField<Date | string>(name);

  const tErr = useValidationMessageTranslation();

  const isError = Boolean(meta.error) && meta.touched;

  const helperText = useMemo(() => {
    if (!isError) {
      return;
    }
    return tErr(meta.error as TranslationKey, { field: datePickerProps.label as string });
  }, [isError, meta.error, tErr, datePickerProps.label]);

  return (
    <AlkemioTimePicker
      value={field.value}
      onChange={helpers.setValue}
      error={helperText}
      onBlur={() => helpers.setTouched(true)}
      fullWidth={true}
      {...datePickerProps}
    />
  );
};

export default FormikTimePicker;
