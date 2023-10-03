import React, { PropsWithChildren, ReactNode } from 'react';
import { AppBar, Box, Slide } from '@mui/material';
import { gutters } from '../grid/utils';
import { GUTTER_PX, MAX_CONTENT_WIDTH_WITH_GUTTER_PX, useGlobalGridColumns } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import GridContainer from '../grid/GridContainer';
import FlexSpacer from '../utils/FlexSpacer';
import hexToRGBA from '../../utils/hexToRGBA';
import { useScrolledUp, useScrollTop } from '../scroll/utils';

interface NavigationBarContentProps {
  transparent: boolean;
}

const NavigationBarContent = ({ transparent, children }: PropsWithChildren<NavigationBarContentProps>) => {
  const globalGridColumns = useGlobalGridColumns();

  return (
    <Box
      flexGrow={1}
      sx={{
        backgroundColor: theme => hexToRGBA(theme.palette.background.paper, transparent ? 0 : 1),
        transition: 'background-color .25s',
      }}
    >
      <GridContainer maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX} marginX="auto" display="flex" flexDirection="row">
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </GridContainer>
    </Box>
  );
};

interface NavigationBarProps {
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
}

const NavigationBar = ({ childrenLeft, childrenRight }: NavigationBarProps) => {
  const scrollTop = useScrollTop();

  const hasScrolledUp = useScrolledUp();

  const navigationHeight = GUTTER_PX * 4;

  const hasScrolledPast = scrollTop > navigationHeight;

  return (
    <Slide appear={false} direction="down" in={!hasScrolledPast || hasScrolledUp}>
      <AppBar
        position={hasScrolledUp ? 'fixed' : 'absolute'}
        color="transparent"
        sx={{
          boxShadow: !hasScrolledPast ? 'none' : undefined,
          flexDirection: 'row',
        }}
      >
        <NavigationBarContent transparent={!hasScrolledPast}>
          <Box display="flex" flexDirection="row" gap={gutters(0.5)} paddingX={gutters()}>
            {childrenLeft}
          </Box>
          <FlexSpacer />
          <Box display="flex" flexDirection="row" gap={gutters(0.5)} paddingX={gutters()}>
            {childrenRight}
          </Box>
        </NavigationBarContent>
      </AppBar>
    </Slide>
  );
};

export default NavigationBar;
