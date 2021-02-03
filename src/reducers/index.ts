import { combineReducers } from 'redux';
import auth from './auth/reducers';
import { AuthActionTypes } from './auth/types';
import error from './error/reducers';
import { ErrorActionTypes } from './error/types';
import notifications from './notifincations/reducers';
import { NotificationActionTypes } from './notifincations/types';
import profile from './profile/reducers';
import { ProfileActionTypes } from './profile/types';

const rootReducer = combineReducers({
  auth,
  profile,
  error,
  notifications,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
export type StoreActions = AuthActionTypes | ProfileActionTypes | ErrorActionTypes | NotificationActionTypes;
