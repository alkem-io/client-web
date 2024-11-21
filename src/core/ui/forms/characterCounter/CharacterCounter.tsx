import { PropsWithChildren } from 'react';
import { DistributiveOmit } from '@mui/types';
import { Box, TypographyProps } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';

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
  flexWrap,
  children,
  ...rest
}: PropsWithChildren<CharacterCounterProps>) => {
  const color = maxLength && count > maxLength ? 'negative.main' : undefined;
  const visibility = !maxLength || maxLength - count > 10 ? 'hidden' : 'visible';

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
        <Caption color={color} visibility={visibility} {...rest}>
          {getText(count, separator, maxLength)}
        </Caption>
      )}
    </Box>
  );
};

export default CharacterCounter;
