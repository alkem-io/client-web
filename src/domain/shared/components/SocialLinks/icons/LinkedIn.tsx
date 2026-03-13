import { LinkedIn as MUILinkedIn } from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';
import type { FC } from 'react';

const LinkedIn: FC<SvgIconProps> = props => {
  return <MUILinkedIn htmlColor="#0e76a8" {...props} />;
};

export default LinkedIn;
