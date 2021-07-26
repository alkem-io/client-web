import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
