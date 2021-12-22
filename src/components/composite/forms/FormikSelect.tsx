import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useField } from 'formik';
import React, { FC } from 'react';

const useStyles = makeStyles(theme => ({
  icon: {
    paddingRight: theme.spacing(1),
    color: theme.palette.primary.main,
    fontSize: theme.typography.body1.fontSize,
  },
  input: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiListItemIcon-root': { minWidth: '36px' },
    '&.MuiSelect-select': {
      height: '1.4375em',
    },
  },
}));

interface FormikSelectProps extends SelectProps {
  title: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  values: { id: string; name: string; icon?: React.ReactElement }[];
  placeholder?: string;
}

export const FormikSelect: FC<FormikSelectProps> = ({
  title,
  name,
  required = false,
  disabled = false,
  values,
  placeholder,
}) => {
  const [field, meta] = useField(name);
  const styles = useStyles();

  return (
    <FormControl required={required} disabled={disabled} fullWidth>
      <InputLabel shrink={true}>{title}</InputLabel>
      <Select
        name={name}
        value={field.value}
        label={title}
        onBlur={field.onBlur}
        onChange={field.onChange}
        variant={'outlined'}
        placeholder={placeholder}
        inputProps={{
          className: styles.input,
        }}
      >
        {values.map(el => (
          <MenuItem key={el.id} value={el.id}>
            {el.icon && <ListItemIcon sx={{ color: 'primary.main' }}>{el.icon}</ListItemIcon>}
            <ListItemText>{el.name}</ListItemText>
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{meta.error}</FormHelperText>
    </FormControl>
  );
};
export default FormikSelect;
