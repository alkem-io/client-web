import { combineReducers } from 'redux';
import auth from './auth/reducers';
import { AuthActionTypes } from './auth/types';
import error from './error/reducers';
import { ErrorActionTypes } from './error/types';
import profile from './profile/reducers';
import { ProfileActionTypes } from './profile/types';

const rootReducer = combineReducers({
  auth,
  profile,
  error,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
export type StoreActions = AuthActionTypes | ProfileActionTypes | ErrorActionTypes;
