import React, { PropsWithChildren, ReactNode } from 'react';
import { AppBar, Box, Slide } from '@mui/material';
import { gutters } from '../grid/utils';
import { GUTTER_PX, MAX_CONTENT_WIDTH_GUTTERS, useGlobalGridColumns } from '../grid/constants';
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
      <GridContainer
        maxWidth={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}
        marginX="auto"
        display="flex"
        flexDirection="row"
        flexWrap="nowrap"
        padding={gutters(0.5)}
      >
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </GridContainer>
    </Box>
  );
};

interface NavigationBarProps {
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
}

export const NAVIGATION_HEIGHT_GUTTERS = 4;

const NavigationBar = ({ childrenLeft, childrenRight }: NavigationBarProps) => {
  const scrollTop = useScrollTop();

  const hasScrolledUp = useScrolledUp();

  const navigationHeight = GUTTER_PX * NAVIGATION_HEIGHT_GUTTERS;

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
          {childrenLeft}
          <FlexSpacer />
          {childrenRight}
        </NavigationBarContent>
      </AppBar>
    </Slide>
  );
};

export default NavigationBar;
