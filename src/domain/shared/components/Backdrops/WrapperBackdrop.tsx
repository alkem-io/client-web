import { styled } from '@mui/material';
import { PropsWithChildren } from 'react';

const Backdrop = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  opacity: 0.5,
  filter: `blur(${theme.spacing(0.5)})`,
  '-webkit-filter': `blur(${theme.spacing(0.5)})`,
  '-moz-filter': `blur(${theme.spacing(0.5)})`,
  '-o-filter': `blur(${theme.spacing(0.5)})`,
  '-ms-filter': `blur(${theme.spacing(0.5)})`,
}));

export const WrapperBackdrop = ({ children }: PropsWithChildren) => {
  return <Backdrop>{children}</Backdrop>;
};

export default WrapperBackdrop;
