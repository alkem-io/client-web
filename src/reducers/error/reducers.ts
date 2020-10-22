import { CLEAR_ERROR, ErrorActionTypes, ErrorState, PUSH_ERROR } from './types';

const initialState: ErrorState = {
  errors: [],
};

export default function errorReducer(state = initialState, action: ErrorActionTypes): ErrorState {
  switch (action.type) {
    case PUSH_ERROR:
      return {
        ...state,
        errors: [...state.errors, { ...action.payload }],
      };
    case CLEAR_ERROR:
      return {
        ...state,
        errors: [...state.errors.slice(1)],
      };
    default:
      return state;
  }
}
