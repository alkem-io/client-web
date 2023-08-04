import { GitHub as MUIGitHub } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import React, { FC } from 'react';

const GitHub: FC<SvgIconProps> = props => {
  return <MUIGitHub htmlColor="#000000" {...props} />;
};

export default GitHub;
