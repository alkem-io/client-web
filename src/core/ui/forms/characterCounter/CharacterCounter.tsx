import React, { PropsWithChildren } from 'react';
import { DistributiveOmit } from '@mui/types';
import { Box, TypographyProps } from '@mui/material';
import { Caption } from '../../typography';
import { gutters } from '../../grid/utils';

type CharacterCounterProps = DistributiveOmit<TypographyProps, 'variant'> & {
  count?: number;
  separator?: string;
  maxLength?: number;
  alwaysVisible?: boolean; // if false: show it only when the user is about to reach the limit
  disabled?: boolean;
};

const getText = (count: number, separator: string, maxLength?: number) =>
  [count, maxLength].filter(num => typeof num !== 'undefined').join(separator);

export const CharacterCounter = ({
  count = 0,
  separator = ' / ',
  disabled = false,
  alwaysVisible = false,
  maxLength,
  flexWrap,
  children,
  ...rest
}: PropsWithChildren<CharacterCounterProps>) => {
  const color = maxLength && count > maxLength ? 'negative.main' : undefined;

  return (
    <Box
      display="flex"
      justifyContent={children ? 'space-between' : 'end'}
      gap={gutters()}
      rowGap={0}
      alignItems="start"
      flexWrap={flexWrap}
    >
      {children}
      {!disabled && (
        <Caption
          color={color}
          {...rest}
          visibility={alwaysVisible || (maxLength && count > maxLength - 10) ? 'visible' : 'hidden'}
        >
          {getText(count, separator, maxLength)}
        </Caption>
      )}
    </Box>
  );
};

export default CharacterCounter;
