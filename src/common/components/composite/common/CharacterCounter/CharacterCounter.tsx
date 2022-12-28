import React, { PropsWithChildren } from 'react';
import { DistributiveOmit } from '@mui/types';
import { Box, Typography, TypographyProps } from '@mui/material';
import { Caption } from '../../../../../core/ui/typography';
import { gutters } from '../../../../../core/ui/grid/utils';

type CharacterCounterProps = DistributiveOmit<TypographyProps, 'variant'> & {
  count?: number;
  separator?: string;
  maxLength?: number;
  disabled?: boolean;
};

const getText = (count: number, separator: string, maxLength?: number) => {
  if (maxLength && count > maxLength) {
    return (
      <Typography color="negative">{`${count}${maxLength !== undefined ? separator + maxLength : ''}`}</Typography>
    );
  } else {
    return <Typography>{`${count}${maxLength !== undefined ? separator + maxLength : ''}`}</Typography>;
  }
};

export const CharacterCounter = ({
  count = 0,
  separator = ' / ',
  disabled = false,
  maxLength,
  children,
  ...rest
}: PropsWithChildren<CharacterCounterProps>) => {
  return (
    <Box display="flex" justifyContent={children ? 'space-between' : 'end'} gap={gutters()}>
      {children}
      {!disabled && <Caption {...rest}>{getText(count, separator, maxLength)}</Caption>}
    </Box>
  );
};

export default CharacterCounter;
