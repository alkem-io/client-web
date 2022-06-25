import { useContext } from 'react';
import { UserContext } from '../../domain/user/providers/UserProvider/UserProvider';

export const useUserContext = () => useContext(UserContext);
