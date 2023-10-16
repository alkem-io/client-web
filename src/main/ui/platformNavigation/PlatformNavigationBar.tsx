import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import PlatformSearch from '../platformSearch/PlatformSearch';
import PlatformNavigationMenuButton from './PlatformNavigationMenuButton';
import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface PlatformNavigationBarProps {
  breadcrumbs: ReactNode;
}

const PlatformNavigationBar = ({ breadcrumbs }: PlatformNavigationBarProps) => {
  return (
    <NavigationBar
      childrenLeft={breadcrumbs}
      childrenRight={
        <Box display="flex" padding={1} gap={1}>
          <PlatformSearch />
          <PlatformNavigationMenuButton />
          <PlatformNavigationUserAvatar />
        </Box>
      }
    />
  );
};

export default PlatformNavigationBar;
