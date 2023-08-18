import { useContext } from 'react';
import { SpaceContext } from './SpaceContext';

export const useSpace = () => useContext(SpaceContext);
