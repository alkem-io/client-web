import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import PlatformSearch from '../platformSearch/PlatformSearch';
import PlatformNavigationMenuButton from './PlatformNavigationMenuButton';
import { Box, useMediaQuery, Theme } from '@mui/material';
import React, { ReactNode } from 'react';
import PlatformNavigationUserMenu from './PlatformNavigationUserMenu';
import UserMenuPlatformNavigationSegment from './platformNavigationMenu/UserMenuPlatformNavigationSegment';

interface PlatformNavigationBarProps {
  breadcrumbs: ReactNode;
}

const PlatformNavigationBar = ({ breadcrumbs }: PlatformNavigationBarProps) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  return (
    <NavigationBar
      childrenLeft={breadcrumbs}
      childrenRight={
        <Box display="flex" padding={1} gap={1}>
          <PlatformSearch />
          {!isMobile && <PlatformNavigationMenuButton />}
          <PlatformNavigationUserAvatar drawer={isMobile}>
            <PlatformNavigationUserMenu surface={!isMobile}>
              {isMobile && <UserMenuPlatformNavigationSegment />}
            </PlatformNavigationUserMenu>
          </PlatformNavigationUserAvatar>
        </Box>
      }
    />
  );
};

export default PlatformNavigationBar;
