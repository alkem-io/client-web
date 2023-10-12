import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import JourneyBreadcrumbs from '../../../domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import PlatformSearch from '../platformSearch/PlatformSearch';
import PlatformNavigationMenuButton from './PlatformNavigationMenuButton';
import { Box } from '@mui/material';

const PlatformNavigationBar = () => {
  return (
    <NavigationBar
      childrenLeft={<JourneyBreadcrumbs />}
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
