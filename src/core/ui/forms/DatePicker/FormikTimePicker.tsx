import React, { useMemo } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import AlkemioTimePicker, { AlkemioTimePickerProps } from './AlkemioTimePicker';
import TranslationKey from '../../../i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '@domain/shared/i18n/ValidationMessageTranslation';

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
      fullWidth
      {...datePickerProps}
    />
  );
};

export default FormikTimePicker;
