import { combineReducers } from 'redux';
import loginNavigation from './loginNavigation/reducers';
import { LoginNavigationActionTypes } from './loginNavigation/types';
import userSegment from './userSegment/reducers';
import { UserSegmentActionTypes } from './userSegment/types';

const uiReducer = combineReducers({
  loginNavigation,
  userSegment,
});

export default uiReducer;
export type UiStoreActions = LoginNavigationActionTypes | UserSegmentActionTypes;
