import { useField } from 'formik';
import { useEffect, useState } from 'react';
import FormikInputField, { FormikInputFieldProps } from '@/core/ui/forms/FormikInputField/FormikInputField';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
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
  const [{ value: sourceFieldValue = '' }, { touched: isSourceFieldTouched }] = useField(sourceFieldName);
  const [{}, { error }, { setValue, setTouched }] = useField(name);

  const [isTouchedByUser, setIsTouchedByUser] = useState(false);

  useEffect(() => {
    if (!isTouchedByUser) {
      const derivedNameId = createNameId(sourceFieldValue);
      setValue(derivedNameId);
    }
  }, [sourceFieldValue]);

  useEffect(() => {
    if (error && isSourceFieldTouched) {
      setTouched(true); // Won't show the error otherwise
    }
  }, [error, isSourceFieldTouched]);

  const origin = usePlatformOrigin();

  return (
    <FormikInputField
      {...props}
      name={name}
      onBlur={() => setIsTouchedByUser(true)}
      InputProps={{
        startAdornment: <Typography color="neutral.light">{`${origin}/`}</Typography>,
      }}
    />
  );
};

export default NameIdField;
