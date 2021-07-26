export const HIDE_USER_SEGMENT = 'HIDE_USER_SEGMENT';
export const SHOW_USER_SEGMENT = 'SHOW_USER_SEGMENT';

export interface ShowUserSegmentAction {
  type: typeof SHOW_USER_SEGMENT;
}
export interface HideUserSegmentAction {
  type: typeof HIDE_USER_SEGMENT;
}

export interface UserSegmentState {
  visible: boolean;
}

export type UserSegmentActionTypes = ShowUserSegmentAction | HideUserSegmentAction;
