import { combineReducers } from 'redux';
import loginNavigation from './loginNavigation/reducers';
import { LoginNavigationActionTypes } from './loginNavigation/types';

const uiReducer = combineReducers({
  loginNavigation,
});

export default uiReducer;
export type UiStoreActions = LoginNavigationActionTypes;
