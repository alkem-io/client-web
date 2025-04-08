import { useContext } from 'react';
import { SubspaceContext } from '../context/SubspaceContext';

export const useSubSpace = () => useContext(SubspaceContext);
