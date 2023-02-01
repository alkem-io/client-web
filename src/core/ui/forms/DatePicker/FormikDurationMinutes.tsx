import React, { useMemo } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { addMinutes } from '../../../utils/time/utils';
import AlkemioTimePicker, { AlkemioTimePickerProps } from './AlkemioTimePicker';
import dayjs from 'dayjs';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import TranslationKey from '../../../../types/TranslationKey';

interface FormikTimePickerProps extends FormikInputProps, Omit<AlkemioTimePickerProps, 'value' | 'onChange'> {
  startTimeFieldName: string;
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const FormikDurationMinutes = ({ name, startTimeFieldName, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, meta, helpers] = useField<number>(name);
  const [startTimeField] = useField<Date | string>(startTimeFieldName);

  const tErr = useValidationMessageTranslation();

  const isError = Boolean(meta.error) && meta.touched;

  console.log({ isError, meta });

  const helperText = useMemo(() => {
    if (!isError) {
      return;
    }
    return tErr(meta.error as TranslationKey, { field: datePickerProps.label as string });
  }, [isError, meta.error, tErr, datePickerProps.label]);

  const handleChange = (endDate: Date) => {
    const startDate = new Date(startTimeField.value);

    const durationMinutes = (endDate.valueOf() - startDate.valueOf()) / MILLISECONDS_IN_MINUTE;

    helpers.setValue(durationMinutes);
  };

  const date = addMinutes(startTimeField.value, field.value);

  return (
    <AlkemioTimePicker
      value={date}
      onChange={handleChange}
      error={helperText}
      onBlur={() => helpers.setTouched(true)}
      minTime={dayjs(startTimeField.value)}
      fullWidth
      {...datePickerProps}
    />
  );
};

export default FormikDurationMinutes;
