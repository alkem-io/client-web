import { GitHub as MUIGitHub } from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';
import type { FC } from 'react';

const GitHub: FC<SvgIconProps> = props => {
  return <MUIGitHub htmlColor="#000000" {...props} />;
};

export default GitHub;
