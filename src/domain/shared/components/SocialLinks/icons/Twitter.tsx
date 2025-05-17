import { X as MuiX } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import React, { FC } from 'react';

const Twitter: FC<SvgIconProps> = props => {
  return <MuiX htmlColor="#181828" {...props} />;
};

export default Twitter;
