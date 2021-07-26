import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { AUTH_STATUS_KEY, TOKEN_KEY } from '../models/Constants';
import reducers, { RootState, StoreActions } from './rootReducer';
import { AuthState, AuthStatus } from './auth/types';
import { isAuthenticated } from '../utils/isAuthenitcated';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const preservedState = () => {
  try {
    let status = localStorage.getItem(AUTH_STATUS_KEY) as AuthStatus;
    status = status === 'done' ? status : 'unauthenticated';
    const token = status === 'done' ? localStorage.getItem(TOKEN_KEY) : undefined;
    return {
      auth: {
        status,
        isAuthenticated: isAuthenticated(status),
        accessToken: token,
      } as AuthState,
    };
  } catch {}
};

export default function configureStore(): Store<RootState, StoreActions> {
  const store = createStore(reducers, preservedState(), composeEnhancers(applyMiddleware(thunk)));

  store.subscribe(() => {
    const auth = store.getState().auth;
    try {
      localStorage.removeItem(TOKEN_KEY);

      if (auth.status) localStorage.setItem(AUTH_STATUS_KEY, auth.status);
      else localStorage.removeItem(AUTH_STATUS_KEY);
    } catch {
      // Ignore errors
    }
  });

  return store;
}
