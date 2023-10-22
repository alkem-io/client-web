import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import PlatformSearch from '../platformSearch/PlatformSearch';
import PlatformNavigationMenuButton from './PlatformNavigationMenuButton';
import { Box, Fade, IconButton, Slide, Theme, useMediaQuery } from '@mui/material';
import React, { cloneElement, ReactElement, useRef, useState } from 'react';
import PlatformNavigationUserMenu from './PlatformNavigationUserMenu';
import UserMenuPlatformNavigationSegment from './platformNavigationMenu/UserMenuPlatformNavigationSegment';
import { ArrowBackIosNew } from '@mui/icons-material';
import NavigationBarSideContent from '../../../core/ui/navigation/NavigationBarSideContent';
import { gutters } from '../../../core/ui/grid/utils';

export interface PlatformNavigationBarProps {
  breadcrumbs?: ReactElement<{ onExpand: (isExpanded: boolean) => void }>;
}

const PlatformNavigationBar = ({ breadcrumbs }: PlatformNavigationBarProps) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  const [areBreadcrumbsHidden, setAreBreadcrumbsHidden] = useState(false);

  const breadcrumbsContainerRef = useRef<HTMLDivElement>(null);

  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const [areButtonsHidden, setAreButtonsHidden] = useState(false);

  return (
    <NavigationBar>
      <NavigationBarSideContent ref={buttonsContainerRef}>
        <Slide in={!areButtonsHidden} container={buttonsContainerRef.current} direction="left">
          <Box
            display="flex"
            gap={gutters(0.5)}
            padding={gutters(0.5)}
            justifyContent="end"
            position="relative"
            style={{
              visibility: 'visible',
            }}
          >
            <PlatformSearch onExpand={setAreBreadcrumbsHidden}>
              <Fade in={areButtonsHidden}>
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: '100%',
                    top: 0,
                    pointerEvents: areButtonsHidden ? 'auto' : 'none',
                  }}
                >
                  <ArrowBackIosNew sx={{ color: 'white' }} />
                </IconButton>
              </Fade>
            </PlatformSearch>
            {!isMobile && <PlatformNavigationMenuButton />}
            <PlatformNavigationUserAvatar drawer={isMobile}>
              <PlatformNavigationUserMenu surface={!isMobile}>
                {isMobile && <UserMenuPlatformNavigationSegment />}
              </PlatformNavigationUserMenu>
            </PlatformNavigationUserAvatar>
          </Box>
        </Slide>
      </NavigationBarSideContent>

      <NavigationBarSideContent
        ref={breadcrumbsContainerRef}
        sx={{
          pointerEvents: 'none',
        }}
      >
        <Slide in={!areBreadcrumbsHidden} container={breadcrumbsContainerRef.current} direction="right">
          <Box display="flex">{breadcrumbs && cloneElement(breadcrumbs, { onExpand: setAreButtonsHidden })}</Box>
        </Slide>
      </NavigationBarSideContent>
    </NavigationBar>
  );
};

export default PlatformNavigationBar;
