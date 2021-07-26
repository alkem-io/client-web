import { combineReducers } from 'redux';
import auth from './auth/reducers';
import { AuthActionTypes } from './auth/types';
import error from './error/reducers';
import { ErrorActionTypes } from './error/types';
import notifications from './notifincations/reducers';
import { NotificationActionTypes } from './notifincations/types';
import ui, { UiStoreActions } from './ui';

const rootReducer = combineReducers({
  auth,
  error,
  notifications,
  ui,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
export type StoreActions = AuthActionTypes | ErrorActionTypes | NotificationActionTypes | UiStoreActions;
