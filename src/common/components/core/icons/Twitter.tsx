import { Twitter as MUITwitter } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import React, { FC } from 'react';

const Twitter: FC<SvgIconProps> = props => {
  return <MUITwitter htmlColor="#00acee" {...props} />;
};

export default Twitter;
