import React from 'react';
import { Checkbox, CheckboxProps } from '@mui/material';

const CookieCheckbox = (props: CheckboxProps) => (
  <Checkbox
    sx={{
      color: theme => theme.palette.background.default,
      checked: { color: theme => theme.palette.background.default },
    }}
    {...props}
  />
);

export default CookieCheckbox;
