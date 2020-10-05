import { CLEAR_ERROR, ErrorActionTypes, PUSH_ERROR } from './types';

export function pushError(error: Error): ErrorActionTypes {
  return {
    type: PUSH_ERROR,
    payload: error,
  };
}

export function clearError(): ErrorActionTypes {
  return {
    type: CLEAR_ERROR,
  };
}
