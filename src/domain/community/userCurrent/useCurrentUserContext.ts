import { useContext } from 'react';
import { CurrentUserContext } from './CurrentUserProvider/CurrentUserProvider';

export const useCurrentUserContext = () => useContext(CurrentUserContext);
