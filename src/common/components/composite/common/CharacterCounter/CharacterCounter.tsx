import React, { PropsWithChildren } from 'react';
import { DistributiveOmit } from '@mui/types';
import { Box, TypographyProps } from '@mui/material';
import { Caption } from '../../../../../core/ui/typography';
import { gutters } from '../../../../../core/ui/grid/utils';

type CharacterCounterProps = DistributiveOmit<TypographyProps, 'variant'> & {
  count?: number;
  separator?: string;
  maxLength?: number;
  disabled?: boolean;
};

const getText = (count: number, separator: string, maxLength?: number) =>
  [count, maxLength].filter(num => typeof num !== 'undefined').join(separator);

export const CharacterCounter = ({
  count = 0,
  separator = ' / ',
  disabled = false,
  maxLength,
  children,
  ...rest
}: PropsWithChildren<CharacterCounterProps>) => {
  const color = maxLength && count > maxLength ? 'negative.main' : undefined;

  return (
    <Box display="flex" justifyContent={children ? 'space-between' : 'end'} gap={gutters()}>
      {children}
      {!disabled && (
        <Caption color={color} {...rest}>
          {getText(count, separator, maxLength)}
        </Caption>
      )}
    </Box>
  );
};

export default CharacterCounter;
