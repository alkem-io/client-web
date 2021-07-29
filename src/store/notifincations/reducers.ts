import { CLEAR_NOTIFICATION, NotificationActionTypes, NotificationState, PUSH_NOTIFICATION } from './types';
import { v4 } from 'uuid';

const initialState: NotificationState = {
  notifications: [],
};

export default function notificationsReducer(state = initialState, action: NotificationActionTypes): NotificationState {
  switch (action.type) {
    case PUSH_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: v4() }],
      };
    case CLEAR_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications.slice(1)],
      };
    default:
      return state;
  }
}
