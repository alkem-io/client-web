import React, { PropsWithChildren, ReactNode, useLayoutEffect, useState } from 'react';
import { AppBar, Box, Paper, Slide } from '@mui/material';
import { gutters } from '../grid/utils';
import { GUTTER_PX, MAX_CONTENT_WIDTH_GUTTERS, useGlobalGridColumns } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import FlexSpacer from '../utils/FlexSpacer';
import hexToRGBA from '../../utils/hexToRGBA';
import { useScrolledUp, useScrollTop } from '../scroll/utils';
import { PLATFORM_NAVIGATION_MENU_ELEVATION } from '../../../main/ui/platformNavigation/constants';

interface NavigationBarContentProps {
  transparent: boolean;
}

const NavigationBarContent = ({ transparent, children }: PropsWithChildren<NavigationBarContentProps>) => {
  const globalGridColumns = useGlobalGridColumns();

  return (
    <Box flexGrow={1} padding={gutters(0.5)} maxWidth={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}>
      <Paper
        elevation={transparent ? 0 : PLATFORM_NAVIGATION_MENU_ELEVATION}
        sx={{
          backgroundColor: theme => hexToRGBA(theme.palette.primary.main, transparent ? 0 : 0.25),
          backdropFilter: transparent ? 'none' : 'blur(8px)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'start',
          flexWrap: 'nowrap',
          marginX: 'auto',
          maxWidth: gutters(MAX_CONTENT_WIDTH_GUTTERS - 2),
        }}
      >
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </Paper>
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

  const [{ isFixed, hasSlidIn }, setState] = useState<{
    isFixed: boolean;
    hasSlidIn: boolean;
  }>({
    isFixed: false,
    hasSlidIn: false,
  });

  useLayoutEffect(() => {
    if (scrollTop === 0) {
      setState({
        isFixed: false,
        hasSlidIn: false,
      });
    }
  }, [scrollTop]);

  useLayoutEffect(() => {
    if (!hasScrolledPast) {
      return;
    }
    if (hasScrolledUp) {
      setState({
        isFixed: true,
        hasSlidIn: true,
      });
    } else {
      setState(prevState => ({
        ...prevState,
        hasSlidIn: false,
      }));
    }
  }, [hasScrolledUp]);

  const hasSurface = isFixed && scrollTop > GUTTER_PX * (NAVIGATION_HEIGHT_GUTTERS - 2);

  return (
    <Slide direction="down" in={!hasScrolledPast || hasSlidIn}>
      <AppBar
        position={isFixed ? 'fixed' : 'absolute'}
        color="transparent"
        sx={{
          boxShadow: 'none',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <NavigationBarContent transparent={!hasSurface}>
          {childrenLeft}
          <FlexSpacer />
          {childrenRight}
        </NavigationBarContent>
      </AppBar>
    </Slide>
  );
};

export default NavigationBar;
