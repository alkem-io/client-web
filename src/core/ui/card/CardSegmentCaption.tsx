import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';
import { BoxTypeMap } from '@mui/material/Box/Box';

interface CardSegmentCaptionProps {
  align: 'left' | 'right';
  icon?: ReactNode;
  noWrap?: boolean;
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const CardSegmentCaption = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  icon,
  align,
  noWrap,
  children,
  ...containerProps
}: CardSegmentCaptionProps & BoxProps<D, P>) => {
  return (
    <Box
      display="flex"
      gap={1}
      height={gutters(2)}
      alignItems="center"
      justifyContent={align === 'right' ? 'end' : 'start'}
      flexDirection={align === 'right' ? 'row' : 'row-reverse'}
      {...containerProps}
    >
      <Caption minWidth={0} noWrap={noWrap}>
        {children}
      </Caption>
      {icon}
    </Box>
  );
};

export default CardSegmentCaption;
