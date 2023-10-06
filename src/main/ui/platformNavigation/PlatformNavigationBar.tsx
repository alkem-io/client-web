import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import JourneyBreadcrumbs from '../../../domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import PlatformSearch from '../platformSearch/PlatformSearch';

const PlatformNavigationBar = () => {
  return (
    <NavigationBar
      childrenLeft={<JourneyBreadcrumbs />}
      childrenRight={
        <>
          <PlatformSearch />
          <PlatformNavigationUserAvatar />
        </>
      }
    />
  );
};

export default PlatformNavigationBar;
