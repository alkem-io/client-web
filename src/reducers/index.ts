import { combineReducers } from 'redux';
import auth from './auth/reducers';
import profile from './profile/reducers';

const rootReducer = combineReducers({
  auth,
  profile,
});

export default rootReducer;

export type IRootState = ReturnType<typeof rootReducer>;
