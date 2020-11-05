import { useContext, useEffect } from 'react';
import { NavigationContext } from '../context/NavigationProvider';

export const useUpdateNavigation = ({ currentPaths }) => {
  const { set } = useContext(NavigationContext);

  useEffect(() => {
    set(currentPaths);
  }, [currentPaths]);
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};
