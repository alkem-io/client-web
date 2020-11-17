import { useContext } from 'react';
import { UserCreationContext } from '../context/navigation/UserCreationProvider';

export const useUserCreationContext = () => {
  const context = useContext(UserCreationContext);

  return { ...context };
};
