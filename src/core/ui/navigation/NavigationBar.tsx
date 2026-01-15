import { PropsWithChildren, useLayoutEffect, useState } from 'react';
import { alpha, AppBar, Box, Paper, Slide } from '@mui/material';
import { gutters } from '../grid/utils';
import { GUTTER_PX, MAX_CONTENT_WIDTH_GUTTERS, useGlobalGridColumns } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import { useScrolledUp, useScrollTop } from '../scroll/utils';
import {
  PLATFORM_NAVIGATION_ITEM_ELEVATION,
  PLATFORM_NAVIGATION_MENU_ELEVATION,
} from '@/main/ui/platformNavigation/constants';
import { ElevationContext } from '../utils/ElevationContext';

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
          backgroundColor: theme => alpha(theme.palette.primary.main, transparent ? 0 : 0.25),
          backdropFilter: transparent ? 'none' : 'blur(8px)',
          position: 'relative',
          overflow: 'visible',
          height: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS - 1),
          maxWidth: gutters(MAX_CONTENT_WIDTH_GUTTERS - 2),
        }}
      >
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </Paper>
    </Box>
  );
};

export const NAVIGATION_CONTENT_HEIGHT_GUTTERS = 3;
export const NAVIGATION_CONTAINER_HEIGHT_GUTTERS = NAVIGATION_CONTENT_HEIGHT_GUTTERS + 1;

interface NavigationBarProps {
  staticPosition?: boolean;
}

const NavigationBar = ({ staticPosition, children }: PropsWithChildren<NavigationBarProps>) => {
  const scrollTop = useScrollTop();

  const hasScrolledUp = useScrolledUp();

  const navigationHeight = GUTTER_PX * NAVIGATION_CONTAINER_HEIGHT_GUTTERS;

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

  const hasSurface = isFixed && scrollTop > GUTTER_PX * (NAVIGATION_CONTAINER_HEIGHT_GUTTERS - 2);

  return (
    <ElevationContext value={hasSurface ? 0 : PLATFORM_NAVIGATION_ITEM_ELEVATION}>
      <Slide direction="down" in={!hasScrolledPast || hasSlidIn}>
        <AppBar
          position={isFixed ? 'fixed' : staticPosition ? 'static' : 'absolute'}
          color="transparent"
          component="nav"
          sx={{
            boxShadow: 'none',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <NavigationBarContent transparent={!hasSurface}>{children}</NavigationBarContent>
        </AppBar>
      </Slide>
    </ElevationContext>
  );
};

export default NavigationBar;
