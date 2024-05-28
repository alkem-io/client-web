import React, { Children, PropsWithChildren, ReactNode } from 'react';
import { Caption } from '../typography';
import { Box } from '@mui/material';

interface HorizontalCardsGroupProps {
  title: ReactNode;
}

const HorizontalCardsGroup = ({ title, children }: PropsWithChildren<HorizontalCardsGroupProps>) => {
  return Children.count(children) === 0 ? null : (
    <>
      <Caption>{title}</Caption>
      <Box marginX={-1}>{children}</Box>
    </>
  );
};

export default HorizontalCardsGroup;
