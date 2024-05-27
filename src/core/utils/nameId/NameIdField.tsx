import { useField } from 'formik';
import React, { useMemo } from 'react';
import FormikInputField, { FormikInputFieldProps } from '../../ui/forms/FormikInputField/FormikInputField';
import usePlatformOrigin from '../../../domain/platform/routes/usePlatformOrigin';
import { Typography } from '@mui/material';
import createNameId from './createNameId';

interface NameIdFieldProps {
  sourceFieldName?: string;
  name?: string;
}

const NameIdField = ({
  sourceFieldName = 'name',
  name = 'nameID',
  ...props
}: FormikInputFieldProps & NameIdFieldProps) => {
  const [{ value: sourceFieldValue = '' }] = useField(sourceFieldName);
  const [{ value }, { touched }, { setValue, setTouched }] = useField(name);

  const nameId = useMemo(() => {
    if (touched) {
      return value;
    } else {
      const derivedNameId = createNameId(sourceFieldValue);
      setValue(derivedNameId);
      return derivedNameId;
    }
  }, [sourceFieldValue, touched, value]);

  const origin = usePlatformOrigin();

  return (
    <FormikInputField
      {...props}
      value={nameId}
      name={name}
      onClick={() => setTouched(true)}
      InputProps={{
        startAdornment: <Typography color="neutral.light">{`${origin}/`}</Typography>,
      }}
    />
  );
};

export default NameIdField;
