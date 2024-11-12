import { Box, BoxProps, Theme, useMediaQuery } from '@mui/material';
import React, { Children, PropsWithChildren, ReactNode } from 'react';
import { Caption } from '../../typography';
import { gutters } from '../../grid/utils';

interface PageFooterProps {
  logo: ReactNode;
  copyright: ReactNode;
}

const wrapChild = (child: ReactNode, index: number) => <Box key={`_footer_item_${index}`}>{child}</Box>;

const PageFooter = ({ logo, copyright, children, ...props }: BoxProps & PropsWithChildren<PageFooterProps>) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  const childrenCount = Children.count(children);
  if (childrenCount % 2 !== 0) {
    console.warn(`Pass an even number of children for a Footer to be symmetrical. Received ${childrenCount} children.`);
  }
  const childrenArray = Children.toArray(children);
  const firstChildren = childrenArray.slice(0, Math.floor(childrenCount / 2)).map(wrapChild);
  const lastChildren = childrenArray.slice(Math.floor(childrenCount / 2)).map(wrapChild);

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? 'column' : 'row-reverse'}
      gap={gutters(isMobile ? 0 : 1)}
      alignItems="center"
      justifyContent="center"
      paddingY={gutters(0.5)}
      paddingX={gutters()}
      {...props}
    >
      {!isMobile && (
        <Box display="flex" flexGrow={1} flexShrink={1}>
          <Caption visibility="hidden">{copyright}</Caption>
        </Box>
      )}
      <Box
        display="flex"
        alignItems="center"
        gap={theme => theme.spacing(1.5)}
        order={isMobile ? 0 : 2}
        height={gutters(2)}
      >
        {logo}
      </Box>
      <Box display="flex" gap={gutters()} alignItems="center" height={gutters(1.5)} order={3}>
        {firstChildren}
      </Box>
      <Box display="flex" gap={gutters()} alignItems="center" height={gutters(1.5)} order={isMobile ? 4 : 1}>
        {lastChildren}
      </Box>
      <Box
        display="flex"
        flexGrow={1}
        flexShrink={0}
        order={5}
        height={gutters(3)}
        alignItems="center"
        alignSelf="start"
      >
        <Caption>{copyright}</Caption>
      </Box>
    </Box>
  );
};

export default PageFooter;
