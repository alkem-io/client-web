import NavigationBar from '../../../core/ui/navigation/NavigationBar';
import PlatformNavigationUserAvatar from './PlatformNavigationUserAvatar';

const PlatformNavigationBar = () => {
  return <NavigationBar childrenRight={<PlatformNavigationUserAvatar />} />;
};

export default PlatformNavigationBar;
