import { HIDE_USER_SEGMENT, UserSegmentActionTypes, UserSegmentState, SHOW_USER_SEGMENT } from './types';

const initialState: UserSegmentState = {
  visible: true,
};

export default function UserSegmentReducer(state = initialState, action: UserSegmentActionTypes): UserSegmentState {
  switch (action.type) {
    case HIDE_USER_SEGMENT:
      return {
        ...state,
        visible: false,
      };

    case SHOW_USER_SEGMENT:
      return {
        ...state,
        visible: true,
      };

    default:
      return state;
  }
}
