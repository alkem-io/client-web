import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';
import { BoxTypeMap } from '@mui/system';

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
