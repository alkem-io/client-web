import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';
import JourneyBreadcrumbs from '../../../domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';

const PlatformNavigationBar = () => {
  return (
    <NavigationBar
      childrenLeft={<JourneyBreadcrumbs />}
      childrenRight={<PlatformNavigationUserAvatar />}
    />
  );
};

export default PlatformNavigationBar;
