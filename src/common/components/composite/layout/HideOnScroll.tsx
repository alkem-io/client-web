import { Slide, useScrollTrigger } from '@mui/material';
import React from 'react';

interface HideOnScrollProps {
  children: React.ReactElement;
}

const HideOnScroll = (props: HideOnScrollProps) => {
  const { children } = props;

  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};
export default HideOnScroll;
