import { useContext, useLayoutEffect } from 'react';
import { NavigationContext, Path } from '../context/NavigationProvider';

interface UseUpdateNavigationOptions {
  currentPaths: Path[] | undefined;
}

export const useUpdateNavigation = ({ currentPaths }: UseUpdateNavigationOptions) => {
  const { set } = useContext(NavigationContext);

  useLayoutEffect(() => {
    if (currentPaths) {
      set(currentPaths);
    }
  }, [currentPaths]);
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};
