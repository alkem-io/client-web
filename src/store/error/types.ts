export const PUSH_ERROR = 'PUSH_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export interface PushErrorAction {
  type: typeof PUSH_ERROR;
  payload: Error;
}

export interface ClearErrorAction {
  type: typeof CLEAR_ERROR;
}

export interface ErrorState {
  errors: Error[];
}

export type ErrorActionTypes = PushErrorAction | ClearErrorAction;
