import { Box, type BoxProps } from '@mui/material';
import type { BoxTypeMap } from '@mui/system';
import type React from 'react';
import type { ReactNode } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

type CardSegmentCaptionProps = {
  align?: 'left' | 'right';
  icon?: ReactNode;
  secondaryIcon?: ReactNode;
  noWrap?: boolean;
  disablePadding?: boolean;
};

const CardSegmentCaption = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  icon: mainIcon,
  secondaryIcon,
  align = 'left',
  noWrap,
  disablePadding,
  children,
  ...containerProps
}: CardSegmentCaptionProps & BoxProps<D, P>) => {
  return (
    <Box
      flexShrink={0}
      display="flex"
      gap={1}
      height={gutters(2)}
      paddingX={disablePadding ? undefined : 1.5}
      alignItems="center"
      justifyContent={align === 'right' ? 'end' : 'start'}
      flexDirection={align === 'right' ? 'row-reverse' : 'row'}
      {...containerProps}
    >
      {mainIcon}
      <Caption minWidth={0} noWrap={noWrap}>
        {children}
      </Caption>
      {secondaryIcon && (
        <Box marginLeft={align === 'left' ? 'auto' : undefined} marginRight={align === 'right' ? 'auto' : undefined}>
          {secondaryIcon}
        </Box>
      )}
    </Box>
  );
};

export default CardSegmentCaption;
