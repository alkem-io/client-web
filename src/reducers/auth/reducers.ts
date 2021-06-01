import { AuthActionTypes, AuthState, UPDATE_STATUS } from './types';

const initialState: AuthState = {
  status: 'unauthenticated',
};

export default function authReducer(state = initialState, action: AuthActionTypes): AuthState {
  switch (action.type) {
    case UPDATE_STATUS:
      return {
        ...state,
        status: action.payload,
      };

    default:
      return state;
  }
}
