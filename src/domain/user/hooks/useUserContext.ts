import { useContext } from 'react';
import { UserContext } from '../providers/UserProvider/UserProvider';

export const useUserContext = () => useContext(UserContext);
