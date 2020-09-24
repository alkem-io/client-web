import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import reducers, { RootState, StoreActions } from './reducers';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(): Store<RootState, StoreActions> {
  return createStore(reducers, composeEnhancers(applyMiddleware(thunk)));
}
