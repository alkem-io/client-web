import { Typography } from '@mui/material';
import React, { PropsWithChildren } from 'react';

const IconLabel = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Typography variant="body1" color="primary" fontWeight="bold" sx={{ paddingX: 2, paddingY: 1 }} noWrap>
      {children}
    </Typography>
  );
};

export default IconLabel;
