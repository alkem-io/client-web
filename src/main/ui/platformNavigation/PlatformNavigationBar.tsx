import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import PlatformSearch from '../platformSearch/PlatformSearch';
import PlatformNavigationMenuButton from './PlatformNavigationMenuButton';
import { Box, useMediaQuery, Theme, Slide, IconButton, Fade } from '@mui/material';
import React, { cloneElement, ReactElement, ReactNode, useRef, useState } from 'react';
import PlatformNavigationUserMenu from './PlatformNavigationUserMenu';
import UserMenuPlatformNavigationSegment from './platformNavigationMenu/UserMenuPlatformNavigationSegment';
import { ArrowBackIosNew } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';

export interface PlatformNavigationBarProps {
  breadcrumbs?: ReactElement<{ onExpand: (isExpanded: boolean) => void; }>;
}

const PlatformNavigationBar = ({ breadcrumbs }: PlatformNavigationBarProps) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  const [areBreadcrumbsHidden, setAreBreadcrumbsHidden] = useState(false);

  const breadcrumbsContainerRef = useRef<HTMLDivElement>(null);

  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const [areButtonsHidden, setAreButtonsHidden] = useState(false);

  return (
    <NavigationBar
      childrenLeft={
        <Box ref={breadcrumbsContainerRef}>
          <Slide in={!areBreadcrumbsHidden} container={breadcrumbsContainerRef.current} direction="right">
            <Box>
              {breadcrumbs && cloneElement(breadcrumbs, { onExpand: setAreButtonsHidden })}
            </Box>
          </Slide>
        </Box>
      }
      childrenRight={
        <Box ref={buttonsContainerRef}>
          <Slide in={!areButtonsHidden} container={buttonsContainerRef.current} direction="left">
            <Box display="flex" padding={1} gap={1} style={{ visibility: 'visible' }}>
              <Fade in={areButtonsHidden}>
                <IconButton sx={{ marginLeft: gutters(-2), visibility: areButtonsHidden ? 'visible' : 'hidden' }}>
                  <ArrowBackIosNew sx={{ color: 'white' }} />
                </IconButton>
              </Fade>
              <PlatformSearch onExpand={setAreBreadcrumbsHidden} />
              {!isMobile && <PlatformNavigationMenuButton />}
              <PlatformNavigationUserAvatar drawer={isMobile}>
                <PlatformNavigationUserMenu surface={!isMobile}>
                  {isMobile && <UserMenuPlatformNavigationSegment />}
                </PlatformNavigationUserMenu>
              </PlatformNavigationUserAvatar>
            </Box>
          </Slide>
        </Box>
      }
    />
  );
};

export default PlatformNavigationBar;
