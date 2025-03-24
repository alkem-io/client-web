import { useContext } from 'react';
import { SubspaceContext } from '../../../space/context/SubspaceProvider';

export const useSubSpace = () => useContext(SubspaceContext);
