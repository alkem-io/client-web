import { useContext } from 'react';
import { UserContext } from '../../context/UserProvider';

export const useUserContext = () => useContext(UserContext);
