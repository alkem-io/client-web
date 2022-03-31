import { useContext, useLayoutEffect } from 'react';
import { NavigationContext } from '../context/NavigationProvider';

export const useUpdateNavigation = ({ currentPaths }) => {
  const { set } = useContext(NavigationContext);

  useLayoutEffect(() => {
    set(currentPaths);
  }, [currentPaths]);
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};
