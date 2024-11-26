import { Children, PropsWithChildren, ReactNode } from 'react';
import { Caption } from '../typography';
import { Box } from '@mui/material';

const HorizontalCardsGroup = ({ title, children }: PropsWithChildren<{ title: ReactNode }>) =>
  Children.count(children) === 0 ? null : (
    <>
      <Caption>{title}</Caption>
      <Box marginX={-1}>{children}</Box>
    </>
  );

export default HorizontalCardsGroup;
