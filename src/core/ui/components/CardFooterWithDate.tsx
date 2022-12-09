import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Caption } from '../typography/components';
import { gutters } from '../grid/utils';

interface CardFooterWithDateProps {
  createdDate: Date | undefined;
}

const CardFooterWithDate = ({ createdDate, children }: PropsWithChildren<CardFooterWithDateProps>) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" height={gutters(2)} paddingX={1}>
      {createdDate && <Caption paddingX={0.5}>{createdDate?.toLocaleDateString()}</Caption>}
      {children}
    </Box>
  );
};

export default CardFooterWithDate;
