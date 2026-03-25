import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  type SelectProps,
} from '@mui/material';
import { useField } from 'formik';
import type React from 'react';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';

export interface FormikSelectValue {
  id: string;
  name: string;
  icon?: React.ReactElement;
}

type FormikSelectProps = {
  title?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  values: FormikSelectValue[];
  endAdornment?: React.ReactNode;
  helpText?: string;
} & SelectProps;

export const FormikSelect = ({
  title,
  name,
  required = false,
  disabled = false,
  values,
  endAdornment,
  helpText: _helperText,
}: FormikSelectProps) => {
  const tErr = useValidationMessageTranslation();

  const [field, meta] = useField(name);
  const isError = Boolean(meta.error) && meta.touched;

  const helperText = (() => {
    if (!isError) {
      return _helperText;
    }

    return tErr(meta.error as TranslationKey, { field: name });
  })();

  return (
    <FormControl required={required} disabled={disabled} fullWidth={true} error={isError}>
      {title && (
        <InputLabel id={`${name}-label`} shrink={true}>
          {title}
        </InputLabel>
      )}
      <Select
        name={name}
        value={field.value}
        label={title}
        labelId={`${title ? `${name}-label` : ''}`}
        onBlur={field.onBlur}
        onChange={field.onChange}
        variant="outlined"
        endAdornment={endAdornment}
        inputProps={{
          sx: {
            display: 'flex',
            alignItems: 'center',
            '&.MuiSelect-select': { height: '1.4375em' },
            '& .MuiListItemIcon-root': { minWidth: '36px' },
          },
        }}
      >
        {values.map(el => (
          <MenuItem key={el.id} value={el.id}>
            {el.icon && (
              <ListItemIcon sx={{ color: 'primary.main', paddingRight: theme => theme.spacing(1) }}>
                {el.icon}
              </ListItemIcon>
            )}
            <ListItemText>{el.name}</ListItemText>
          </MenuItem>
        ))}
      </Select>
      <FormHelperText sx={{ color: 'red' }}>{helperText}</FormHelperText>
    </FormControl>
  );
};

export default FormikSelect;
