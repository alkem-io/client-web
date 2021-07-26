import { HIDE_USER_SEGMENT, UserSegmentActionTypes, SHOW_USER_SEGMENT } from './types';

export function showUserSegment(): UserSegmentActionTypes {
  return {
    type: SHOW_USER_SEGMENT,
  };
}

export function hideUserSegment(): UserSegmentActionTypes {
  return {
    type: HIDE_USER_SEGMENT,
  };
}
