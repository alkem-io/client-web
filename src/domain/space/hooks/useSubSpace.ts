import { useContext } from 'react';
import { SubspaceContext } from '../context/SubspaceProvider';

export const useSubSpace = () => useContext(SubspaceContext);
